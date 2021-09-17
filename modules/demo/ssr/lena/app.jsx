// Copyright (c) 2020-2021, NVIDIA CORPORATION.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';

import { TextLayer, PolygonLayer } from '@deck.gl/layers';

import { default as DeckGL } from '@deck.gl/react';
import { log as deckLog, OrthographicView } from '@deck.gl/core';

import { GraphLayer } from '@rapidsai/deck.gl';

import { as as asAsyncIterable } from 'ix/asynciterable/as';
import { takeWhile } from 'ix/asynciterable/operators/takewhile';

import { default as loadGraphData } from './loader';

deckLog.level = 0;
deckLog.enable(false);

const composeFns = (fns) => function (...args) { fns.forEach((fn) => fn && fn.apply(this, args)); }

export class App extends React.Component {

  constructor(props, context) {
    super(props, context);
    this._isMounted = false;
    this._deck = React.createRef();

    //center of the screen in 0,0
    // 400 wide
    // 300 tall
    // for some reason ???
    // 0,0 -> -200,-150
    //1  4
    //2  3
    var initrectdata = [
      {
        polygon: [[-200, -150], [-200, -50], [-100, -50], [-100, -150]],
        show: false
      },
    ];

    this.state = { graph: {}, autoCenter: true, labels: [], rectdata: initrectdata, startPos: [0, 0] };

    function convertCoords(x, y) {
      // 0,0 -> -200,-150
      // 800,600 -> 200,150
      // 400,300 -> 0,0
      // 0,600 -> -200,150
      // 800,0 -> 200,-150

      return { x: (x / 2) - 200, y: (y / 2 - 150) };
    }

    const onDrag = (info, event) => {
      const px = info.x;
      const py = info.y;
      const { x, y } = convertCoords(px, py)
      // console.log("onDrag: ", x, y)
      // console.log(this.state.rectdata);
      this.setState((state, props) => {
        const startPoint = state.rectdata[0].polygon[0];
        return {
          rectdata: [{
            polygon: [
              startPoint,
              [startPoint[0], y],
              [x, y],
              [x, startPoint[1]]
            ],
            show: true,
          }]
        }
      });
      //if (target) { [window, target].forEach((element) => (element.style || {}).cursor = 'grabbing'); }
    }

    const onDragStart = (info, event) => {
      console.log('onDragStart');
      const px = info.x;
      const py = info.y;
      const { x, y } = convertCoords(px, py)
      this.setState((state, props) => {
        return {
          rectdata: [{
            polygon: [
              [x, y],
              [x, y],
              [x, y],
              [x, y]
            ],
            show: true,
          }],
          startPos: [px, py]
        }
      });
      console.log(x, y);
    }

    const onDragEnd = (info, event) => {
      console.log('onDragEnd');
      const px = info.x;
      const py = info.y;
      const { x, y } = convertCoords(px, py)
      this.setState((state, props) => {
        return {
          rectdata: [{
            polygon: state.rectdata[0].polygon,
            show: false,
          }]
        };
      });
      console.log(x, y);

      const sx = this.state.startPos[0];
      const sy = this.state.startPos[1];

      // TODO: negative width/height doesnt work it seems
      let selectInfo = this._deck.current.pickObjects({
        x: sx,
        y: sy,
        width: px - sx,
        height: py - sy,
      });
      const nodes = selectInfo.filter(selected => selected.hasOwnProperty('nodeId'));

      const nodelabels = nodes.map(n => [n.nodeId, n.layer.props.data.nodes.attributes.nodeName.getValue(n.nodeId)]);

      props.peer.send(JSON.stringify({ type: 'data', data: nodelabels }));
    }

    const onHover = ({ index }, { target }) => {
      if (target) {
        [window, target].forEach((element) => (element.style || {}).cursor =
          ~index ? 'pointer' : 'default');
      }
    }

    const handleClick = (info, event) => {
      // let selectInfo = this._deck.current.pickObjects({
      //   x: info.x,
      //   y: info.y,
      //   width: 150,
      //   height: 150,
      // });
      // const nodes = selectInfo.filter(selected => selected.hasOwnProperty('nodeId'));

      // const nodelabels = nodes.map(n => [n.nodeId, n.layer.props.data.nodes.attributes.nodeName.getValue(n.nodeId)]);

      // props.peer.send(JSON.stringify({ type: 'data', data: nodelabels }));
    };

    props.onClick = handleClick;
    props.onHover = onHover;
    props.onDrag = onDrag;
    props.onDragEnd = onDragEnd;
    props.onDragStart = onDragStart;


  }
  componentWillUnmount() { this._isMounted = false; }
  componentDidMount() {
    this._isMounted = true;
    asAsyncIterable(loadGraphData(this.props))
      .pipe(takeWhile(() => this._isMounted))
      .forEach((state) => this.setState(state))
      .catch((e) => console.error(e));
  }

  render() {
    const { onAfterRender, ...props } = this.props;
    const { params = {}, selectedParameter, labels } = this.state;
    const [viewport] = (this._deck?.current?.deck?.viewManager?.getViewports() || []);

    if (this.state.autoCenter && this.state.bbox) {
      const viewState = centerOnBbox(this.state.bbox);
      viewState && (props.initialViewState = viewState);
    }

    let [
      minX = Number.NEGATIVE_INFINITY, minY = Number.NEGATIVE_INFINITY,
      maxX = Number.POSITIVE_INFINITY, maxY = Number.POSITIVE_INFINITY,
    ] = (viewport?.getBounds() || []);

    if (labels[1] && isFinite(minX + maxY)) {
      labels[1].position = [minX, maxY];
    }

    //console.log(this.state.rectdata);
    return (
      <DeckGL {...props}
        ref={this._deck}
        onViewStateChange={() => this.setState({
          autoCenter: params.autoCenter ? (params.autoCenter.val = false) : false
        })}
        onAfterRender={composeFns([onAfterRender, this.state.onAfterRender])}>
        <PolygonLayer
          data={this.state.rectdata}
          getPolygon={d => d.polygon}
          filled={false}
          stroked={this.state.rectdata?.[0].show}
        />
        <GraphLayer
          edgeStrokeWidth={2}
          edgeOpacity={.5}
          nodesStroked={true}
          nodeFillOpacity={.5}
          nodeStrokeOpacity={.9}
          getNodeLabels={getNodeLabels}
          getEdgeLabels={getEdgeLabels}
          labels={this.state.labels}
          {...this.state.graph}
        />
        {
          viewport && selectedParameter !== undefined ?
            <TextLayer
              sizeScale={1}
              opacity={0.9}
              maxWidth={2000}
              pickable={false}
              backgroundColor={[46, 46, 46]}
              getTextAnchor='start'
              getAlignmentBaseline='top'
              getSize={(d) => d.size}
              getColor={(d) => d.color}
              getPixelOffset={(d) => [0, d.index * 15]}
              getPosition={(d) => d.position}
              data={Object.keys(params).map((key, i) => ({
                size: 15,
                index: i,
                text: i === selectedParameter
                  ? `(${i}) ${params[key].name}: ${params[key].val}`
                  : ` ${i}  ${params[key].name}: ${params[key].val}`,
                color: [255, 255, 255],
                position: [minX, minY],
              }))}
            /> : null
        }
      </DeckGL >
    );
  }
}

export default App;

App.defaultProps = {
  controller: {
    keyboard: false,
    doubleClickZoom: false,
    scrollZoom: {
      speed: 0.01,
      smooth: true,
    },
    dragPan: false
  },
  initialViewState: {
    zoom: 1,
    target: [0, 0, 0],
    minZoom: Number.NEGATIVE_INFINITY,
    maxZoom: Number.POSITIVE_INFINITY,
  },
  views: [
    new OrthographicView({
      clear: {
        color: [...[46, 46, 46].map((x) => x / 255), 1]
      }
    })
  ]
};

function centerOnBbox([minX, maxX, minY, maxY]) {
  const width = maxX - minX, height = maxY - minY;
  if ((width === width) && (height === height)) {
    const { outerWidth, outerHeight } = window;
    const world = (width > height ? width : height);
    const screen = (width > height ? outerWidth : outerHeight) * .9;
    const zoom = (world > screen ? -(world / screen) : (screen / world));
    return {
      minZoom: Number.NEGATIVE_INFINITY,
      maxZoom: Number.POSITIVE_INFINITY,
      zoom: Math.log(Math.abs(zoom)) * Math.sign(zoom),
      target: [minX + (width * .5), minY + (height * .5), 0],
    };
  }
}

function getNodeLabels({ x, y, coordinate, nodeId, props, layer }) {
  let size = 14;
  const color = [255, 255, 255];
  props.labels.length = 1;
  props.labels[0] = {
    size, color, offset: [14, 0],
    position: coordinate || layer.context.viewport.unproject([x, y]),
    text: props.data.nodes.attributes.nodeName
      ? props.data.nodes.attributes.nodeName.getValue(nodeId)
      : `${nodeId}`,
  };
  if (props.data.nodes.attributes.nodeData) {
    size *= 1.5;
    props.labels.length = 2;
    const text = `${props.data.nodes.attributes.nodeData.getValue(nodeId) || ''}`.trimEnd();
    const lineSpacing = 3, padding = 20;
    const nBreaks = ((text.match(/\n/ig) || []).length + 1);
    const offsetX = 0, offsetY = (size + lineSpacing) * nBreaks;
    const [minX, , , maxY] = layer.context.viewport.getBounds();
    props.labels[1] = {
      text, color, size, position: [minX, maxY],
      offset: [offsetX + padding, -padding - offsetY],
    };
  }
  return props.labels;
}

function getEdgeLabels({ x, y, coordinate, edgeId, props, layer }) {
  let size = 14;
  const color = [255, 255, 255];
  props.labels.length = 1;
  props.labels[0] = {
    size, color, offset: [14, 0],
    position: coordinate || layer.context.viewport.unproject([x, y]),
    text: props.data.edges.attributes.edgeName
      ? props.data.edges.attributes.edgeName.getValue(edgeId)
      : `${sourceNodeId} - ${targetNodeId}`,
  };
  if (props.data.edges.attributes.edgeData) {
    size *= 1.5;
    props.labels.length = 2;
    const text = `${props.data.edges.attributes.edgeData.getValue(edgeId) || ''}`.trimEnd();
    const lineSpacing = 3, padding = 20;
    const nBreaks = ((text.match(/\n/ig) || []).length + 1);
    const offsetX = 0, offsetY = (size + lineSpacing) * nBreaks;
    const [minX, , , maxY] = layer.context.viewport.getBounds();
    props.labels[1] = {
      text, color, size, position: [minX, maxY],
      offset: [offsetX + padding, -padding - offsetY],
    };
  }
  return props.labels;
}
