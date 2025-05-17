import { NextFunction, Request, Response } from "express";

const _response_object = Object.freeze({
  _status: 200,
  _code: "ok",
  _message: "OK",
  _data: null
});

const mw_response_success = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    !(
      res.locals &&
      res.locals.__response &&
      Object.keys(res.locals.__response).length > 0
    )
  ) {
    return next({ _status: 404, _code: "not_found", _message: "Not Found" });
  }

  return res.status(res.locals.__response._status || 200).send({
    status: res.locals.__response._status || _response_object._status,
    code: res.locals.__response._code || _response_object._code,
    message: res.locals.__response._message || _response_object._message,
    data: res.locals.__response._data || _response_object._data
  });
};

export { mw_response_success };
