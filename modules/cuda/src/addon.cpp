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

#include "node_cuda/addon.hpp"
#include "node_cuda/array.hpp"
#include "node_cuda/device.hpp"
#include "node_cuda/memory.hpp"
#include "node_cuda/utilities/cpp_to_napi.hpp"
#include "node_cuda/utilities/napi_to_cpp.hpp"

#include <nv_node/addon.hpp>
#include <nv_node/macros.hpp>
#include <nv_node/utilities/args.hpp>

#include <nppi.h>

struct node_cuda : public nv::EnvLocalAddon, public Napi::Addon<node_cuda> {
  node_cuda(Napi::Env const& env, Napi::Object exports) : EnvLocalAddon(env, exports) {
    _driver     = Napi::Persistent(Napi::Object::New(env));
    _runtime    = Napi::Persistent(Napi::Object::New(env));
    _after_init = Napi::Persistent(Napi::Function::New(
      env, [](Napi::CallbackInfo const& info) { NODE_CU_TRY(cuInit(0), info.Env()); }));

    nv::gl::initModule(env, exports, _driver.Value(), _runtime.Value());
    nv::kernel::initModule(env, exports, _driver.Value(), _runtime.Value());
    nv::math::initModule(env, exports, _driver.Value(), _runtime.Value());
    nv::program::initModule(env, exports, _driver.Value(), _runtime.Value());
    nv::stream::initModule(env, exports, _driver.Value(), _runtime.Value());
    // nv::texture::initModule(env, exports, _driver.Value(), _runtime.Value());
    nv::memory::initModule(env, exports, _driver.Value(), _runtime.Value());

    DefineAddon(exports,
                {
                  InstanceMethod("init", &node_cuda::InitAddon),
                  InstanceValue("_cpp_exports", _cpp_exports.Value()),

                  InstanceValue("driver", _driver.Value()),
                  InstanceValue("runtime", _runtime.Value()),

                  InstanceValue("VERSION", Napi::Number::New(env, CUDA_VERSION)),
                  InstanceValue("IPC_HANDLE_SIZE", Napi::Number::New(env, CU_IPC_HANDLE_SIZE)),

                  InstanceMethod<&node_cuda::get_driver_version>("getDriverVersion"),
                  InstanceMethod<&node_cuda::rgba_mirror>("rgbaMirror"),

                  InstanceValue("Device", InitClass<nv::Device>(env, exports)),
                  InstanceValue("PinnedMemory", InitClass<nv::PinnedMemory>(env, exports)),
                  InstanceValue("DeviceMemory", InitClass<nv::DeviceMemory>(env, exports)),
                  InstanceValue("ManagedMemory", InitClass<nv::ManagedMemory>(env, exports)),
                  InstanceValue("IpcMemory", InitClass<nv::IpcMemory>(env, exports)),
                  InstanceValue("IpcHandle", InitClass<nv::IpcHandle>(env, exports)),
                  InstanceValue("MappedGLMemory", InitClass<nv::MappedGLMemory>(env, exports)),
                  InstanceValue("CUDAArray", InitClass<nv::CUDAArray>(env, exports)),

                });
  }

 private:
  Napi::ObjectReference _driver;
  Napi::ObjectReference _runtime;

  Napi::Value get_driver_version(Napi::CallbackInfo const& info) {
    int driverVersion;
    auto env = info.Env();
    NODE_CU_TRY(cuDriverGetVersion(&driverVersion), env);
    return Napi::Number::New(env, driverVersion);
  }

  Napi::Value rgba_mirror(Napi::CallbackInfo const& info) {
    nv::CallbackArgs args{info};
    int32_t width         = args[0];
    int32_t height        = args[1];
    NppiAxis flip         = static_cast<NppiAxis>(args[2].operator uint32_t());
    nv::Span<uint8_t> src = args[3];
    NppiSize roi          = {width, height};
    if (info.Length() == 4) {
      nppiMirror_8u_C4IR(src.data(), width * 4, roi, flip);
    } else if (info.Length() == 5) {
      nv::Span<uint8_t> dst = args[4];
      nppiMirror_8u_C4R(src.data(), width * 4, dst.data(), width * 4, roi, flip);
    }

    return info.Env().Undefined();
  }
};

NODE_API_ADDON(node_cuda);
