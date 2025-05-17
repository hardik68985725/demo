import { Response, Router as ExpressRouter } from "express";
import { AppModuleRouter } from "./app_module_loader";
import { mw_onclose_response } from "./middlewares/onclose_response.middleware";
import { mw_bind_app_data } from "./middlewares/bind_app_data.middleware";
import { mw_response_success } from "./middlewares/response_success.middleware";
import { mw_response_error } from "./middlewares/response_error.middleware";

const router = ExpressRouter();

// TO CHECK APIS WORKING OK
router.get("/ok", (_req, res: Response) => res.status(200).send("ok"));

// PERFORM ON res.send();
router.use(mw_onclose_response);
// /PERFORM ON res.send();

// BIND app headers TO REQUEST OBJECT.
router.use(mw_bind_app_data);
// /BIND app headers TO REQUEST OBJECT.

// ---------------------------------------------------------------------------
// MODULE ROUTER MIDDLEWARE
router.use("/api/v1", AppModuleRouter);
// /MODULE ROUTER MIDDLEWARE
// ---------------------------------------------------------------------------

// FINALE RESPONSE HANDLER
router.use(mw_response_success);
// /FINALE RESPONSE HANDLER

// ERROR HANDLER
router.use(mw_response_error);
// /ERROR HANDLER

export { router as AppRouter };
