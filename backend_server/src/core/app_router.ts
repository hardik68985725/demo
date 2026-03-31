import { Router as ExpressRouter } from "express";
import { AppModuleRouter } from "@app_root/core/app_module_loader";
import { mw_onclose_response } from "@app_root/core/middlewares/onclose_response.middleware";
import { mw_bind_app_data } from "@app_root/core/middlewares/bind_app_data.middleware";
import { mw_response_success } from "@app_root/core/middlewares/response_success.middleware";
import { mw_response_error } from "@app_root/core/middlewares/response_error.middleware";

const router = ExpressRouter();

router.get(["/", "/ok"], (_req, res) => {
  res.send("OK");
});

router.use(
  "/api/v1",
  mw_onclose_response,
  mw_bind_app_data,
  AppModuleRouter,
  mw_response_success,
  mw_response_error
);

export { router as AppRouter };
