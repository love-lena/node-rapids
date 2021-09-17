#!/usr/bin/env -S node --trace-uncaught

// Copyright (c) 2021, NVIDIA CORPORATION.
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

delete process.env.DISPLAY;

require('@babel/register')({
  cache: false,
  babelrc: false,
  cwd: __dirname,
  presets: [
    ['@babel/preset-env', {'targets': {'node': 'current'}}],
    ['@babel/preset-react', {'useBuiltIns': true}]
  ]
});

const Path            = require('path');
const wrtc            = require('wrtc');
const Fastify         = require('fastify');
const Peer            = require('simple-peer');
const {RapidsJSDOM}   = require('@rapidsai/jsdom');
const copyFramebuffer = require('./copy')();

const fastify = Fastify()
                  .register(require('fastify-socket.io'))
                  .register(require('fastify-static'), {root: Path.join(__dirname, 'public')})
                  .get('/', (req, reply) => reply.sendFile('video.html'));

fastify.listen(8080)
  .then(() => fastify.io.on('connect', onConnect))
  .then(() => console.log('server ready'));

function onConnect(sock) {
  let jsdom  = null;
  const peer = new Peer({
    wrtc,
    sdpTransform: (sdp) => {
      // Remove bandwidth restrictions
      // https://github.com/webrtc/samples/blob/89f17a83ed299ef28d45b933419d809b93d41759/src/content/peerconnection/bandwidth/js/main.js#L240
      sdp = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '');
      return sdp;
    }
  });
  peer.on('close', closeConnection);
  peer.on('error', closeConnection);
  peer.on('data', onDataChannelMessage);
  sock.on('disconnect', () => peer.destroy());
  sock.on('signal', (data) => { peer.signal(data); });
  peer.on('signal', (data) => { sock.emit('signal', data); });
  peer.on('connect', () => {
    const stream = new wrtc.MediaStream({id: `${sock.id}:video`});
    const source = new wrtc.nonstandard.RTCVideoSource({});
    stream.addTrack(source.createTrack());
    peer.addStream(stream);
    jsdom = createGraph(source, peer);
  });

  function closeConnection(err) {
    console.log('connection closed' + (err ? ` (${err})` : ''));
    jsdom?.window?.dispatchEvent({type: 'close'});
    jsdom = null;
    sock.disconnect(true);
    err ? peer.destroy(err) : peer.destroy();
  }

  function onDataChannelMessage(msg) {
    const {type, data} = (() => {
      try {
        return JSON.parse('' + msg);
      } catch (e) { return {}; }
    })();
    switch (data && type) {
      case 'event': {
        jsdom?.window.dispatchEvent(data);
        break;
      }
    }
  }
}

function createGraph(source, peer) {
  const jsdom = new RapidsJSDOM({
    module: {
      path: __dirname,
    },
    glfwOptions: {
      width: 800,
      height: 600,
    }
  });

  jsdom.window.evalFn(() => {
    const React         = require('react');
    const ReactDOM      = require('react-dom');
    const {Framebuffer} = require('@luma.gl/webgl');
    const App           = require('./app.jsx').default;
    let framebuffer     = null;
    const props         = {
      peer: peer,
      onWebGLInitialized: (gl) => framebuffer = new Framebuffer(gl),
      onBeforeRender({gl}) { this._framebuffer = framebuffer; },
      onResize({width, height}) { framebuffer.resize({width, height}); },
      onAfterRender({gl}) { __onFrame({gl, framebuffer: this._framebuffer}); },
    };

    ReactDOM.render(React.createElement(App, props),
                    document.body.appendChild(document.createElement('div')));
  }, {
    __onFrame({gl, framebuffer}) { source.onFrame(copyFramebuffer({gl, framebuffer})); },
    peer,
  });

  return jsdom;
}
