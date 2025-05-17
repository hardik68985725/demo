const {
  my_type: { is_an_empty_object },
} = require("../helpers/helpers.index");

module.exports.mw_handle_controller = (_controller) => {
  // RETURN A MIDDLEWARE FUNCTION OF CONTROLLER.
  return async (req, res, next) => {
    try {
      // CALLED CONTROLLER FUNCTION AND PASSED req OBJECT.
      const _return = await _controller(req);
      res.locals = is_an_empty_object(_return) ? null : _return;
    } catch (_caught_error) {
      // SEND ERROR
      return next(_caught_error);
    }

    return next();
  };
};
