import { NextFunction, Request, Response } from "express";

const mw_onclose_response = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const on_close = async () => {
    res.removeListener("close", on_close);
    await req.app_data.db_connection?.close();
  };

  res.on("close", on_close);

  return next();
};

export { mw_onclose_response };
