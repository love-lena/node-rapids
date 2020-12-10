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

#include <node_cuda/utilities/cpp_to_napi.hpp>

#include <nv_node/utilities/cpp_to_napi.hpp>

#include <rmm/cuda_stream_view.hpp>
#include <rmm/mr/device/per_device_resource.hpp>

namespace nv {

template <>
inline Napi::Value CPPToNapi::operator()(rmm::cuda_device_id const& device) const {
  return this->operator()(device.value());
}

template <>
inline Napi::Value CPPToNapi::operator()(rmm::cuda_stream_view const& stream) const {
  return this->operator()(stream.value());
}

}  // namespace nv