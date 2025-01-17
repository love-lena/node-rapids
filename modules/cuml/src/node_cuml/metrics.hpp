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

#pragma once

// todo: including the below headers with undef guards is the only way cuml builds with raft
// locally
#include "cuml/metrics/metrics.hpp"
#include "raft/linalg/distance_type.h"

#include <nv_node/utilities/args.hpp>

#include <raft/handle.hpp>

#include <napi.h>

namespace nv {

namespace Metrics {
Napi::Value trustworthiness(Napi::CallbackInfo const& info);
}  // namespace Metrics
}  // namespace nv
