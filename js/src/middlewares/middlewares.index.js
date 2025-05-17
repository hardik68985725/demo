const { mw_throttle } = require("./throttle.middleware");
const { mw_onclose_response } = require("./onclose_response.middleware");
const { mw_response_success } = require("./response_success.middleware");
const { mw_response_error } = require("./response_error.middleware");
const { mw_handle_controller } = require("./handle_controller.middleware");
const { mw_multipart_formdata } = require("./multipart_formdata.middleware");
const { mw_auth } = require("./auth.middleware");
const { mw_role } = require("./role.middleware");

module.exports = {
  mw_throttle,
  mw_onclose_response,
  mw_response_success,
  mw_response_error,
  mw_handle_controller,
  mw_multipart_formdata,
  mw_auth,
  mw_role,
};
