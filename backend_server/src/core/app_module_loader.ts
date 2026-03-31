import { Router as ExpressRouter, RequestHandler } from "express";
import { mw_handle_controller } from "@app_root/core/middlewares/handle_controller.middleware";
import { mw_auth } from "@app_root/core/middlewares/auth.middleware";
import modules from "@app_root/app_modules";

const router = ExpressRouter();

for (const module of modules) {
  if (module.isEnabled === false) continue;

  for (const controller of module.controllers) {
    if (controller.isEnabled === false) continue;

    const middlewares: RequestHandler[] = [];

    const isAuthRequired = controller.isAuthRequired !== false;
    if (isAuthRequired) {
      middlewares[0] = mw_auth;
    }
    for (const _middleware of controller.middlewares) {
      middlewares[middlewares.length] = _middleware;
    }

    router[controller.method](
      `${module.routePath.trim()}${controller.routePath.trim()}`,
      middlewares,
      mw_handle_controller(controller.controller as unknown as ExpressRouter)
    );
  }
}

export { router as AppModuleRouter };
