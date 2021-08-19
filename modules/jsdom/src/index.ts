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

import * as jsdom from 'jsdom';
import * as Url from 'url';

import {installGetContext, installImageData} from './polyfills/canvas';
import {installFetch} from './polyfills/fetch';
import {installGLFWWindow} from './polyfills/glfw';
import {installJSDOMUtils} from './polyfills/jsdom';
import {installMjolnirHammer} from './polyfills/mjolnir';
import {createObjectUrlAndTmpDir} from './polyfills/object-url';
import {
  AnimationFrameRequest,
  AnimationFrameRequestedCallback,
  installAnimationFrame
} from './polyfills/raf';
import {installStreams} from './polyfills/streams';

export interface RapidsJSDOMOptions extends jsdom.ConstructorOptions {
  module?: NodeModule;
  frameRate?: number;
  reportUnhandledExceptions?: boolean;
  onAnimationFrameRequested?: AnimationFrameRequestedCallback;
}

export const defaultOptions = {
  reportUnhandledExceptions: true,
  onAnimationFrameRequested: undefined
};

export class RapidsJSDOM extends jsdom.JSDOM {
  constructor(options: RapidsJSDOMOptions = {}) {
    const opts = Object.assign({}, defaultOptions, options);
    const {
      url,
      install: installObjectURL,
    } = createObjectUrlAndTmpDir();
    super(undefined, {
      ...opts,
      url,
      pretendToBeVisual: true,
      runScripts: 'outside-only',
      resources: new ImageLoader(url),
      beforeParse(window) {
        const {
          module: mod,
          reportUnhandledExceptions,
          onAnimationFrameRequested = defaultFrameScheduler(window, opts),
        } = opts;

        if (reportUnhandledExceptions) { installUnhandledExceptionListeners(); }

        installJSDOMUtils(window, mod);
        installFetch(window);
        installStreams(window);
        installObjectURL(window);
        installImageData(window);
        installGetContext(window);
        installGLFWWindow(window);
        installAnimationFrame(window, onAnimationFrameRequested);
        installMjolnirHammer(window);
      }
    });
  }

  static fromReactComponent(componentPath: string, jsdomOptions = {}, reactProps = {}) {
    const jsdom = new RapidsJSDOM(jsdomOptions);
    jsdom.window.evalFn(() => {
      const React     = require('react');
      const ReactDOM  = require('react-dom');
      const Component = require(componentPath);
      ReactDOM.render(React.createElement(Component.default || Component, reactProps),
                      document.body.appendChild(document.createElement('div')));
    }, {componentPath, reactProps});
    return jsdom;
  }
}

class ImageLoader extends jsdom.ResourceLoader {
  constructor(private _url: string) { super(); }
  fetch(url: string, options: jsdom.FetchOptions) {
    // Hack since JSDOM 16.2.2: If loading a relative file
    // from our dummy localhost URI, translate to a file:// URI.
    if (url.startsWith(this._url)) { url = url.slice(this._url.length); }
    const isDataURI  = url && url.startsWith('data:');
    const isFilePath = !isDataURI && !Url.parse(url).protocol;
    return super.fetch(isFilePath ? `file://${process.cwd()}/${url}` : url, options);
  }
}

function defaultFrameScheduler(window: jsdom.DOMWindow, {frameRate: fps = 60}: RapidsJSDOMOptions) {
  let request: AnimationFrameRequest|null = null;
  let interval: any                       = setInterval(() => {
    if (request) {
      const f = request.flush;
      request = null;
      f(() => {});
    }
    window.poll();
  }, 1000 / fps);
  window.addEventListener('close', () => {
    interval && clearInterval(interval);
    request = interval = null;
  }, {once: true});
  return (r_: AnimationFrameRequest) => { request = r_; };
}

function installUnhandledExceptionListeners() {
  process.on(<any>'uncaughtException', (err: Error, origin: any) => {
    /* eslint-disable @typescript-eslint/restrict-template-expressions */
    process.stderr.write(`Uncaught Exception\n` + (origin ? `Origin: ${origin}\n` : '') +
                         `Exception: ${err && err.stack || err}\n`);
  });

  process.on(<any>'unhandledRejection', (err: Error, promise: any) => {
    /* eslint-disable @typescript-eslint/restrict-template-expressions */
    process.stderr.write(`Unhandled Promise Rejection\n` +
                         (promise ? `Promise: ${promise}\n` : '') +
                         `Exception: ${err && err.stack || err}\n`);
  });
}
