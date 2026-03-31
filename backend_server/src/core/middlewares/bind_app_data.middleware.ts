import { NextFunction, Request, Response } from "express";
import { my_url } from "@app_root/core/helpers";

/**
 * Bind app data headers to request object.
 */
const mw_bind_app_data = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.appData = {
    auth: {},
    subdomain: my_url.getSubdomain(req),
    useragent: {
      browser: req.useragent?.browser,
      os: req.useragent?.os,
      platform: req.useragent?.platform,
      source: req.useragent?.source,
      version: req.useragent?.version
    },
    validationData: {}
  };

  return next();
};

export { mw_bind_app_data };
