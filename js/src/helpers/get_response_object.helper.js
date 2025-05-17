module.exports.get_response_object = (_status, _code, _message, _data) => {
  return {
    status: _status || 200,
    code: _code || "ok",
    message: _message || "OK",
    data: _data || null,
  };
};
