const throttle = require("express-throttle");

module.exports.mw_throttle = (_burst, _period) => {
  if (!(_burst && Number.isSafeInteger(_burst))) {
    _burst = 5;
  }
  if (!(_period && Number.isSafeInteger(_period))) {
    _period = 10000;
  }

  const _throttle_option = {
    burst: _burst,
    period: _period.toString().trim().concat("ms"),
    // eslint-disable-next-line no-unused-vars
    on_allowed: (req, res, next, bucket) => {
      return next();
    },
    // eslint-disable-next-line no-unused-vars
    on_throttled: async (req, res, next, bucket) => {
      try {
        throw {
          _status: 429,
          _code: "too_many_requests",
          _message: "Too Many Requests",
        };
      } catch (_caught_error) {
        return next(_caught_error);
      }
    },
  };

  return throttle(_throttle_option);
};
