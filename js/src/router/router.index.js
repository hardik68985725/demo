const express = require("express");
const router = express.Router();

// IMPORT MODULE ROUTER MIDDLEWARE FILE
const { module_router } = require("../modules/modules.index");
// /IMPORT MODULE ROUTER MIDDLEWARE FILE

// IMPORT MIDDLEWARE
const {
  mw_onclose_response,
  mw_response_success,
  mw_response_error,
} = require("../middlewares/middlewares.index");
// /IMPORT MIDDLEWARE

// IMPORT HELPER
const {
  my_console: { reset_console },
} = require("../helpers/helpers.index");
// /IMPORT HELPER

// RESET THE CONSOLE
router.use((req, res, next) => {
  reset_console();

  return next();
});
// /RESET THE CONSOLE

// PERFORM ON res.send();
router.use(mw_onclose_response);
// /PERFORM ON res.send();

router.get("/", (req, res, next) => next()); // DEFAULT ROUTE

// MODULE ROUTER MIDDLEWARE
router.use("/api/v1", module_router);
// /MODULE ROUTER MIDDLEWARE

// TO CHECK APIS WORKING OK
router.get("/ok", (req, res, next) => {
  res.locals._message = "ok";
  res.locals._data = "ok";

  return next();
});
// /TO CHECK APIS WORKING OK

// FINALE RESPONSE HANDLER
router.use(mw_response_success);
// /FINALE RESPONSE HANDLER

// ERROR HANDLER
router.use(mw_response_error);
// /ERROR HANDLER

module.exports.Router = router;
