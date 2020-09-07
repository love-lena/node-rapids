// Copyright (c) 2020, NVIDIA CORPORATION.
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

require('segfault-handler').registerHandler('./crash.log');

require('@babel/register')({
    cache: false,
    babelrc: false,
    presets: [
        ["@babel/preset-env", { "targets": { "node": "current" }}],
        ['@babel/preset-react', { "useBuiltIns": true }]
    ]
});

const { createModuleWindow } = require('@nvidia/glfw');
const { videoEncoderCallbacks } = require('@nvidia/deck.gl');
module.exports = createModuleWindow(`${__dirname}/app.js`, true);

if (require.main === module) {
    module.exports.open({ transparent: false, ...videoEncoderCallbacks() });
}