module.exports.get_exception_object = (_status, _code, _message, _data) => {
  return {
    status: _status || 400,
    code: _code || "bad_request",
    message: _message || "Bad Request",
    data: _data || null,
  };
};
