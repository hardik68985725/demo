import { NextFunction, Request, Response } from "express";

const _exception_object = Object.freeze({
  _status: 400,
  _code: "bad_request",
  _message: "Bad Request",
  _data: null
});

const mw_response_error = (
  error: typeof _exception_object,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.my_log_point("error", error);

  return res.status(error._status || _exception_object._status).send({
    status: error._status || _exception_object._status,
    code: error._code || _exception_object._code,
    message: error._message || _exception_object._message,
    data: error._data || _exception_object._data
  });
};

export { mw_response_error };
