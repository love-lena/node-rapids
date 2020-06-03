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

#include <node_glfw/casting.hpp>
#include <node_glfw/glfw.hpp>
#include <node_glfw/macros.hpp>

namespace node_glfw {

namespace {
template <std::size_t I = 0, typename FuncT, typename... Tp>
inline typename std::enable_if<I == sizeof...(Tp), void>::type for_each(
  std::tuple<Tp...>&,
  FuncT)  // Unused arguments are given no names.
{}

template <std::size_t I = 0, typename FuncT, typename... Tp>
  inline typename std::enable_if <
  I<sizeof...(Tp), void>::type for_each(std::tuple<Tp...>& t, FuncT f) {
  f(std::get<I>(t));
  for_each<I + 1, FuncT, Tp...>(t, f);
}

template <typename R, typename... Args>
struct js_callback;

template <typename R, typename... Args>
struct js_callback<R (*)(Args...)> {
  Napi::FunctionReference cb{};
  auto Env() { return cb.Env(); }
  void Reset() {
    // std::cout << "cpp removed callback" << std::endl;
    cb.Reset();
  }
  void Reset(const Napi::Function& value) {
    // std::cout << "cpp added callback" << std::endl;
    cb = Napi::Persistent(value);
    cb.SuppressDestruct();
  }
  R operator()(Args const&... args) {
    if (!cb.IsEmpty()) {
      Napi::Env env = Env();
      auto cast_t   = ToNapi(env);
      std::vector<napi_value> xs{};
      std::tuple<Args...> ys{args...};
      for_each(ys, [&](auto v) { xs.push_back(cast_t(v)); });
      cb.MakeCallback(env.Global(), xs);
    }
  }
};
}  // namespace

auto GLFWerror_cb_js              = js_callback<GLFWerrorfun>{};
auto GLFWmonitor_cb_js            = js_callback<GLFWmonitorfun>{};
auto GLFWjoystick_cb_js           = js_callback<GLFWjoystickfun>{};
auto GLFWwindowpos_cb_js          = js_callback<GLFWwindowposfun>{};
auto GLFWwindowsize_cb_js         = js_callback<GLFWwindowsizefun>{};
auto GLFWwindowclose_cb_js        = js_callback<GLFWwindowclosefun>{};
auto GLFWwindowrefresh_cb_js      = js_callback<GLFWwindowrefreshfun>{};
auto GLFWwindowfocus_cb_js        = js_callback<GLFWwindowfocusfun>{};
auto GLFWwindowiconify_cb_js      = js_callback<GLFWwindowiconifyfun>{};
auto GLFWwindowmaximize_cb_js     = js_callback<GLFWwindowmaximizefun>{};
auto GLFWframebuffersize_cb_js    = js_callback<GLFWframebuffersizefun>{};
auto GLFWwindowcontentscale_cb_js = js_callback<GLFWwindowcontentscalefun>{};
auto GLFWkey_cb_js                = js_callback<GLFWkeyfun>{};
auto GLFWchar_cb_js               = js_callback<GLFWcharfun>{};
auto GLFWcharmods_cb_js           = js_callback<GLFWcharmodsfun>{};
auto GLFWmousebutton_cb_js        = js_callback<GLFWmousebuttonfun>{};
auto GLFWcursorpos_cb_js          = js_callback<GLFWcursorposfun>{};
auto GLFWcursorenter_cb_js        = js_callback<GLFWcursorenterfun>{};
auto GLFWscroll_cb_js             = js_callback<GLFWscrollfun>{};

void GLFWerror_cb(int32_t error_code, const char* description) {
  // std::cout << "GLFWerror_cb " << error_code << " " << description << std::endl;
  GLFWerror_cb_js(error_code, description);
}
void GLFWmonitor_cb(GLFWmonitor* monitor, int32_t event) {
  // std::cout << "GLFWmonitor_cb " << event << std::endl;
  GLFWmonitor_cb_js(monitor, event);
}
void GLFWjoystick_cb(int32_t joystick, int32_t event) {
  // std::cout << "GLFWjoystick_cb " << joystick << " " << event << std::endl;
  GLFWjoystick_cb_js(joystick, event);
}
void GLFWwindowpos_cb(GLFWwindow* window, int32_t x, int32_t y) {
  // std::cout << "GLFWwindowpos_cb" << " " << x << " " << y << std::endl;
  GLFWwindowpos_cb_js(window, x, y);
}
void GLFWwindowsize_cb(GLFWwindow* window, int32_t width, int32_t height) {
  // std::cout << "GLFWwindowsize_cb" << " " << width << " " << height << std::endl;
  GLFWwindowsize_cb_js(window, width, height);
}
void GLFWwindowclose_cb(GLFWwindow* window) {
  // std::cout << "GLFWwindowclose_cb" << std::endl;
  GLFWwindowclose_cb_js(window);
}
void GLFWwindowrefresh_cb(GLFWwindow* window) {
  // std::cout << "GLFWwindowrefresh_cb" << std::endl;
  GLFWwindowrefresh_cb_js(window);
}
void GLFWwindowfocus_cb(GLFWwindow* window, int32_t focused) {
  // std::cout << "GLFWwindowfocus_cb" << " " << focused << std::endl;
  GLFWwindowfocus_cb_js(window, focused);
}
void GLFWwindowiconify_cb(GLFWwindow* window, int32_t iconified) {
  // std::cout << "GLFWwindowiconify_cb" << " " << iconified << std::endl;
  GLFWwindowiconify_cb_js(window, iconified);
}
void GLFWwindowmaximize_cb(GLFWwindow* window, int32_t maximized) {
  // std::cout << "GLFWwindowmaximize_cb" << " " << maximized << std::endl;
  GLFWwindowmaximize_cb_js(window, maximized);
}
void GLFWframebuffersize_cb(GLFWwindow* window, int32_t width, int32_t height) {
  // std::cout << "GLFWframebuffersize_cb" << " " << width << " " << height << std::endl;
  GLFWframebuffersize_cb_js(window, width, height);
}
void GLFWwindowcontentscale_cb(GLFWwindow* window, float xscale, float yscale) {
  // std::cout << "GLFWwindowcontentscale_cb" << " " << xscale << " " << yscale << std::endl;
  GLFWwindowcontentscale_cb_js(window, xscale, yscale);
}
void GLFWkey_cb(GLFWwindow* window, int32_t key, int32_t scancode, int32_t action, int32_t mods) {
  // std::cout << "GLFWkey_cb" << " " << key << " " << scancode << " " << action << " " << mods <<
  // std::endl;
  GLFWkey_cb_js(window, key, scancode, action, mods);
}
void GLFWchar_cb(GLFWwindow* window, uint32_t codepoint) {
  // std::cout << "GLFWchar_cb" << " " << codepoint << std::endl;
  GLFWchar_cb_js(window, codepoint);
}
void GLFWcharmods_cb(GLFWwindow* window, uint32_t codepoint, int32_t mods) {
  // std::cout << "GLFWcharmods_cb" << " " << codepoint << " " << mods << std::endl;
  GLFWcharmods_cb_js(window, codepoint, mods);
}
void GLFWmousebutton_cb(GLFWwindow* window, int32_t button, int32_t action, int32_t mods) {
  // std::cout << "GLFWmousebutton_cb" << " " << button << " " << action << " " << mods <<
  // std::endl;
  GLFWmousebutton_cb_js(window, button, action, mods);
}
void GLFWcursorpos_cb(GLFWwindow* window, double x, double y) {
  // std::cout << "GLFWcursorpos_cb" << " " << x << " " << y << std::endl;
  GLFWcursorpos_cb_js(window, x, y);
}
void GLFWcursorenter_cb(GLFWwindow* window, int32_t entered) {
  // std::cout << "GLFWcursorenter_cb" << " " << entered << std::endl;
  GLFWcursorenter_cb_js(window, entered);
}
void GLFWscroll_cb(GLFWwindow* window, double x, double y) {
  // std::cout << "GLFWscroll_cb" << " " << x << " " << y << std::endl;
  GLFWscroll_cb_js(window, x, y);
}

Napi::FunctionReference GLFWdrop_cb_js;
void GLFWdrop_cb(GLFWwindow* window, int count, const char** paths) {
  auto env    = GLFWdrop_cb_js.Env();
  auto cast_t = ToNapi(env);
  GLFWdrop_cb_js.MakeCallback(env.Global(),
                              {cast_t(std::vector<std::string>{paths, paths + count})});
}

// GLFWAPI GLFWerrorfun glfwSetErrorCallback(GLFWerrorfun callback);
Napi::Value glfwSetErrorCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[0].IsNull() || info[0].IsEmpty()) {
    GLFWerror_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetErrorCallback(NULL));
  } else {
    GLFWerror_cb_js.Reset(info[0].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetErrorCallback(GLFWerror_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWmonitorfun glfwSetMonitorCallback(GLFWmonitorfun callback);
Napi::Value glfwSetMonitorCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[0].IsNull() || info[0].IsEmpty()) {
    GLFWmonitor_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetMonitorCallback(NULL));
  } else {
    GLFWmonitor_cb_js.Reset(info[0].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetMonitorCallback(GLFWmonitor_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWjoystickfun glfwSetJoystickCallback(GLFWjoystickfun callback);
Napi::Value glfwSetJoystickCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[0].IsNull() || info[0].IsEmpty()) {
    GLFWjoystick_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetJoystickCallback(NULL));
  } else {
    GLFWjoystick_cb_js.Reset(info[0].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetJoystickCallback(GLFWjoystick_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowposfun glfwSetWindowPosCallback(GLFWwindow* window, GLFWwindowposfun callback);
Napi::Value glfwSetWindowPosCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowpos_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowPosCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowpos_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowPosCallback(FromJS(info[0]), GLFWwindowpos_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowsizefun glfwSetWindowSizeCallback(GLFWwindow* window, GLFWwindowsizefun
// callback);
Napi::Value glfwSetWindowSizeCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowsize_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowSizeCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowsize_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowSizeCallback(FromJS(info[0]), GLFWwindowsize_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowclosefun glfwSetWindowCloseCallback(GLFWwindow* window, GLFWwindowclosefun
// callback);
Napi::Value glfwSetWindowCloseCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowclose_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowCloseCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowclose_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowCloseCallback(FromJS(info[0]), GLFWwindowclose_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowrefreshfun glfwSetWindowRefreshCallback(GLFWwindow* window,
// GLFWwindowrefreshfun callback);
Napi::Value glfwSetWindowRefreshCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowrefresh_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowRefreshCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowrefresh_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowRefreshCallback(FromJS(info[0]), GLFWwindowrefresh_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowfocusfun glfwSetWindowFocusCallback(GLFWwindow* window, GLFWwindowfocusfun
// callback);
Napi::Value glfwSetWindowFocusCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowfocus_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowFocusCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowfocus_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowFocusCallback(FromJS(info[0]), GLFWwindowfocus_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowiconifyfun glfwSetWindowIconifyCallback(GLFWwindow* window,
// GLFWwindowiconifyfun callback);
Napi::Value glfwSetWindowIconifyCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowiconify_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowIconifyCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowiconify_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowIconifyCallback(FromJS(info[0]), GLFWwindowiconify_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowmaximizefun glfwSetWindowMaximizeCallback(GLFWwindow* window,
// GLFWwindowmaximizefun callback);
Napi::Value glfwSetWindowMaximizeCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowmaximize_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowMaximizeCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowmaximize_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetWindowMaximizeCallback(FromJS(info[0]), GLFWwindowmaximize_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWframebuffersizefun glfwSetFramebufferSizeCallback(GLFWwindow* window,
// GLFWframebuffersizefun callback);
Napi::Value glfwSetFramebufferSizeCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWframebuffersize_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetFramebufferSizeCallback(FromJS(info[0]), NULL));
  } else {
    GLFWframebuffersize_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetFramebufferSizeCallback(FromJS(info[0]), GLFWframebuffersize_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWwindowcontentscalefun glfwSetWindowContentScaleCallback(GLFWwindow* window,
// GLFWwindowcontentscalefun callback);
Napi::Value glfwSetWindowContentScaleCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWwindowcontentscale_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetWindowContentScaleCallback(FromJS(info[0]), NULL));
  } else {
    GLFWwindowcontentscale_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(
      env, GLFWAPI::glfwSetWindowContentScaleCallback(FromJS(info[0]), GLFWwindowcontentscale_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWkeyfun glfwSetKeyCallback(GLFWwindow* window, GLFWkeyfun callback);
Napi::Value glfwSetKeyCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWkey_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetKeyCallback(FromJS(info[0]), NULL));
  } else {
    GLFWkey_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetKeyCallback(FromJS(info[0]), GLFWkey_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWcharfun glfwSetCharCallback(GLFWwindow* window, GLFWcharfun callback);
Napi::Value glfwSetCharCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWchar_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetCharCallback(FromJS(info[0]), NULL));
  } else {
    GLFWchar_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetCharCallback(FromJS(info[0]), GLFWchar_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWcharmodsfun glfwSetCharModsCallback(GLFWwindow* window, GLFWcharmodsfun callback);
Napi::Value glfwSetCharModsCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWcharmods_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetCharModsCallback(FromJS(info[0]), NULL));
  } else {
    GLFWcharmods_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetCharModsCallback(FromJS(info[0]), GLFWcharmods_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWmousebuttonfun glfwSetMouseButtonCallback(GLFWwindow* window, GLFWmousebuttonfun
// callback);
Napi::Value glfwSetMouseButtonCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWmousebutton_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetMouseButtonCallback(FromJS(info[0]), NULL));
  } else {
    GLFWmousebutton_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetMouseButtonCallback(FromJS(info[0]), GLFWmousebutton_cb));
  }
  return env.Undefined();
}

Napi::Value glfwSetCursorPosCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWcursorpos_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetCursorPosCallback(FromJS(info[0]), NULL));
  } else {
    GLFWcursorpos_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetCursorPosCallback(FromJS(info[0]), GLFWcursorpos_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWcursorenterfun glfwSetCursorEnterCallback(GLFWwindow* window, GLFWcursorenterfun
// callback);
Napi::Value glfwSetCursorEnterCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWcursorenter_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetCursorEnterCallback(FromJS(info[0]), NULL));
  } else {
    GLFWcursorenter_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetCursorEnterCallback(FromJS(info[0]), GLFWcursorenter_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWscrollfun glfwSetScrollCallback(GLFWwindow* window, GLFWscrollfun callback);
Napi::Value glfwSetScrollCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWscroll_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetScrollCallback(FromJS(info[0]), NULL));
  } else {
    GLFWscroll_cb_js.Reset(info[1].As<Napi::Function>());
    GLFW_TRY(env, GLFWAPI::glfwSetScrollCallback(FromJS(info[0]), GLFWscroll_cb));
  }
  return env.Undefined();
}

// GLFWAPI GLFWdropfun glfwSetDropCallback(GLFWwindow* window, GLFWdropfun callback);
Napi::Value glfwSetDropCallback(Napi::CallbackInfo const& info) {
  auto env = info.Env();
  if (info[1].IsNull() || info[1].IsEmpty() || info[1].IsUndefined()) {
    GLFWdrop_cb_js.Reset();
    GLFW_TRY(env, GLFWAPI::glfwSetDropCallback(FromJS(info[0]), NULL));
  } else {
    GLFWdrop_cb_js = Napi::Persistent(info[1].As<Napi::Function>());
    GLFWdrop_cb_js.SuppressDestruct();
    GLFW_TRY(env, GLFWAPI::glfwSetDropCallback(FromJS(info[0]), GLFWdrop_cb));
  }
  return env.Undefined();
}

}  // namespace node_glfw
