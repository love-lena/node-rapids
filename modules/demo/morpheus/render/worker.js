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

const Path            = require('path');
const copyFramebuffer = require('./copy')();
const {RapidsJSDOM}   = require('@rapidsai/jsdom');
const moduleDir       = Path.dirname(require.resolve('@rapidsai/demo-graph'));

let loop  = null;
let jsdom = null;

function render({data, events = [], sharedMemoryKey}) {
  process.chdir(moduleDir);
  const {width = 800, height = 600, animationProps} = data;

  if (!loop) { ({jsdom, loop} = createLoop(width, height)); }

  Object.assign(jsdom.window, {width, height});
  if (animationProps && loop.animationProps) {  //
    Object.assign(loop.animationProps, animationProps);
  }

  events.filter(Boolean).forEach((event) => {
    try {
      jsdom.window.dispatchEvent(event);
    } catch (e) { console.error(e && e.stack || e); }
  });

  const rendered = loop.waitForRender().then((loop) => {
    const props = Object.keys(loop.animationProps).reduce((props, key) => {
      const val = loop.animationProps[key];
      switch (val && typeof val) {
        case null:
        case undefined:
        case 'number':
        case 'string':
        case 'boolean': props[key] = val;
        default: break;
      }
      return props;
    }, {_mousePosition: loop.animationProps._mousePosition});
    return ({...data, animationProps: props, frame: copyFramebuffer(loop, sharedMemoryKey)});
  });

  loop.start();

  return rendered;
}

function createLoop(width, height) {
  const state = {};

  console.log(state);
  console.log(Path.join(moduleDir, '/src/app.js'));
  console.log({
    glfwOptions: {
      title: '',
      visible: true,
      transparent: false,
    },
    module: {path: moduleDir},
    onAnimationFrameRequested: immediateAnimationFrame(state),
  });
  console.log({
    nodes: inputs(delay, parseArg('--nodes=')),
    edges: inputs(delay, parseArg('--edges=')),
    width: parseInt(parseArg('--width=', 800)) | 0,
    height: parseInt(parseArg('--height=', 600)) | 0,
    layoutParams: JSON.parse(`{${parseArg('--params=')}}`),
  });

  console.log(process.cwd());

  state.jsdom =
    RapidsJSDOM.fromReactComponent('./src/app.js',
                                   {
                                     glfwOptions: {
                                       title: '',
                                       visible: true,
                                       transparent: false,
                                     },
                                     module: {path: moduleDir},
                                     onAnimationFrameRequested: immediateAnimationFrame(state),
                                   },
                                   {
                                     nodes: inputs(delay, parseArg('--nodes=')),
                                     edges: inputs(delay, parseArg('--edges=')),
                                     width: parseInt(parseArg('--width=', 800)) | 0,
                                     height: parseInt(parseArg('--height=', 600)) | 0,
                                     layoutParams: JSON.parse(`{${parseArg('--params=')}}`),
                                   });

  console.log(state.jsdom);

  state.loop = state.jsdom.window.evalFn(() => {
    __babel({
      cache: false,
      babelrc: false,
      cwd: process.cwd(),
      presets: [
        ['@babel/preset-env', {'targets': {'node': 'current'}}],
        ['@babel/preset-react', {'useBuiltIns': true}]
      ]
    });

    window.website = true;
    window.width   = __width;
    window.height  = __height;

    const AppAnimationLoop   = require('./app').default;
    const {AnimationLoopSSR} = require('@rapidsai/deck.gl');

    ((src, dst) => {
      dst.start                   = src.start;
      dst.pause                   = src.pause;
      dst._renderFrame            = src._renderFrame;
      dst.onAfterRender           = src.onAfterRender;
      dst.onBeforeRender          = src.onBeforeRender;
      dst._initializeCallbackData = src._initializeCallbackData;
      dst._requestAnimationFrame  = src._requestAnimationFrame;
    })(AnimationLoopSSR.prototype, AppAnimationLoop.prototype);

    const loop = new AppAnimationLoop({
      width: window.width,
      height: window.height,
      createFramebuffer: true,
    });

    loop.props._onAfterRender = ({_loop}) => { _loop.pause(); };

    return loop;
  }, {
    __width: width,
    __height: height,
    __babel: require('@babel/register'),
  });

  return state;
}

let args = process.argv.slice(2);
if (args.length === 1 && args[0].includes(' ')) { args = args[0].split(' '); }

const parseArg = (prefix, fallback = '') =>
  (args.find((arg) => arg.includes(prefix)) || `${prefix}${fallback}`).slice(prefix.length);

const delay = Math.max(0, parseInt(parseArg('--delay=', 0)) | 0);

async function* inputs(delay, paths) {
  const sleep = (t) => new Promise((r) => setTimeout(r, t));
  for (const path of paths.split(',')) {
    if (path) { yield path; }
    await sleep(delay);
  }
}

function immediateAnimationFrame(state) {
  let request  = null;
  let flushing = false;
  const flush = () => {
    flushing = true;
    while (request && request.active) {
      const f = request.flush;
      request = null;
      f();
    }
    flushing = false;
  };
  return function onAnimationFrameRequested(r) {
    if (flushing) { return request = r; }
    if (state.loop._initialized) { return flush(request = r); }
    if (!request && (request = r)) { setImmediate(flush); }
  };
}

module.exports.render = render;

if (require.main === module) {
  const {fromEvent, EMPTY}                  = require('rxjs');
  const {tap, groupBy, mergeMap, concatMap} = require('rxjs/operators');

  fromEvent(process, 'message', (x) => x)
    .pipe(groupBy(({type}) => type))
    .pipe(mergeMap((group) => {
      switch (group.key) {
        case 'exit': return group.pipe(tap(() => process.exit(0)));
        case 'render.request':
          return group                                                                //
            .pipe(concatMap(({data}) => render(data), ({id}, data) => ({id, data})))  //
            .pipe(tap((result) => process.send({...result, type: 'render.result'})));
      }
      return EMPTY;
    }))
    .subscribe();
}
