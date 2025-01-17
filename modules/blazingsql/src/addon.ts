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

/* eslint-disable @typescript-eslint/no-redeclare */

import {addon as CUDA} from '@nvidia/cuda';
import {loadNativeModule} from '@rapidsai/core';
import {addon as CUDF} from '@rapidsai/cudf';
import {addon as RMM} from '@rapidsai/rmm';

export const {
  getTableScanInfo,
  runGenerateGraph,
  runGeneratePhysicalGraph,
  startExecuteGraph,
  getExecuteGraphResult,
  Context,
  ExecutionGraph,
} =
  loadNativeModule<typeof import('./node_blazingsql')>(
    module, 'node_blazingsql', init => init(CUDA, RMM, CUDF));

export type getTableScanInfo         = typeof import('./node_blazingsql').getTableScanInfo;
export type runGenerateGraph         = typeof import('./node_blazingsql').runGenerateGraph;
export type runGeneratePhysicalGraph = typeof import('./node_blazingsql').runGeneratePhysicalGraph;
export type startExecuteGraph        = typeof import('./node_blazingsql').startExecuteGraph;
export type getExecuteGraphResult    = typeof import('./node_blazingsql').getExecuteGraphResult;

export type Context        = import('./node_blazingsql').Context;
export type ExecutionGraph = import('./node_blazingsql').ExecutionGraph;
