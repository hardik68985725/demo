import { NextFunction, Request, Response } from "express";

const DEFAULT_EXCEPTION = {
  _status: 400,
  _code: "bad_request",
  _message: "Bad Request",
  _data: null
} as const;

/**
 * Error response handler middleware.
 */
const mw_response_error = (
  error: Partial<typeof DEFAULT_EXCEPTION>,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  myLogger.error(error);

  const {
    _status: status = DEFAULT_EXCEPTION._status,
    _code: code = DEFAULT_EXCEPTION._code,
    _message: message = DEFAULT_EXCEPTION._message,
    _data: data = DEFAULT_EXCEPTION._data
  } = error || {};

  res.status(status).send({ status, code, message, data });
};

export { mw_response_error };
