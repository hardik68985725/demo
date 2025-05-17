const { get_response_object } = require("../helpers/helpers.index");

module.exports.mw_response_success = (req, res, next) => {
  if (!(res.locals && Object.keys(res.locals).length > 0)) {
    return next({ _status: 404, _code: "not_found", _message: "Not Found" });
  }

  return res
    .status(res.locals._status || 200)
    .send(
      get_response_object(
        res.locals._status,
        res.locals._code,
        res.locals._message,
        res.locals._data
      )
    );
};
