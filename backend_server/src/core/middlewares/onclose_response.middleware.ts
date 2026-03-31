import { NextFunction, Request, Response } from "express";

/**
 * Perform on res.send();
 */
const mw_onclose_response = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _onClose = async () => {
    res.removeListener("close", _onClose);
    await req.appData?.dbConnection?.client.close();
  };

  res.on("close", _onClose);

  return next();
};

export { mw_onclose_response };
