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

#include <cudf/concatenate.hpp>
#include <node_cudf/table.hpp>

namespace nv {

Napi::Value Table::concat(Napi::CallbackInfo const& info) {
  CallbackArgs args{info};

  std::vector<Table::wrapper_t> tables = args[0];
  rmm::mr::device_memory_resource* mr  = args[1];

  NODE_CUDF_EXPECT(
    tables.size() > 0, "Table concat requires non-empty array of tables", args.Env());

  std::vector<cudf::table_view> table_views;
  table_views.reserve(tables.size());
  std::transform(tables.begin(),
                 tables.end(),
                 std::back_inserter(table_views),
                 [](const Table::wrapper_t& t) -> cudf::table_view { return t->view(); });

  try {
    return Table::New(info.Env(), cudf::concatenate(table_views, mr));
  } catch (cudf::logic_error const& err) { NAPI_THROW(Napi::Error::New(info.Env(), err.what())); }
}

}  // namespace nv
