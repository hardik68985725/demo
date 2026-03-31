import { NextFunction, Request, Response } from "express";

const DEFAULT_RESPONSE = {
  _status: 200,
  _code: "ok",
  _message: "OK",
  _data: null
} as const;

/**
 * Success response handler middleware.
 */
const mw_response_success = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = res.locals.__response;

  if (!payload || !Object.keys(payload).length) {
    return next({ _status: 404, _code: "not_found", _message: "Not Found" });
  }

  const {
    _status: status = DEFAULT_RESPONSE._status,
    _code: code = DEFAULT_RESPONSE._code,
    _message: message = DEFAULT_RESPONSE._message,
    _data: data = DEFAULT_RESPONSE._data
  } = payload;

  res.status(status).send({ status, code, message, data });
};

export { mw_response_success };
