import { Router as ExpressRouter } from "express";
import { mw_handle_controller } from "./middlewares/handle_controller.middleware";
import { mw_auth } from "./middlewares/auth.middleware";
import { default as modules } from "@app_root/app_modules";

const router = ExpressRouter();

for (const _module of modules) {
  if (!_module.is_disabled) {
    for (const _controller of _module.controllers) {
      if (!_controller.is_disabled) {
        const middlewares: Array<any> = [];
        if (_controller.is_auth_required) {
          middlewares[0] = mw_auth;
        }
        for (const _middleware of _controller.middlewares) {
          middlewares[middlewares.length] = _middleware;
        }

        router[_controller.method](
          `${_module.route_path.trim()}${_controller.route_path.trim()}`,
          middlewares,
          mw_handle_controller(
            _controller.controller as unknown as ExpressRouter
          )
        );
      }
    }
  }
}

export { router as AppModuleRouter };
