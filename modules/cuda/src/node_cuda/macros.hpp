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

#pragma once

#include "node_cuda/utilities/error.hpp"

#ifndef EXPORT_PROP
#define EXPORT_PROP(exports, name, val) exports.Set(name, val);
#endif

#ifndef EXPORT_ENUM
#define EXPORT_ENUM(env, exports, name, val) \
  EXPORT_PROP(exports, name, Napi::Number::New(env, val));
#endif

#ifndef EXPORT_FUNC
#define EXPORT_FUNC(env, exports, name, func)                                                   \
  exports.DefineProperty(Napi::PropertyDescriptor::Function(                                    \
    env,                                                                                        \
    exports,                                                                                    \
    Napi::String::New(env, name),                                                               \
    func,                                                                                       \
    static_cast<napi_property_attributes>(napi_writable | napi_enumerable | napi_configurable), \
    nullptr));
#endif