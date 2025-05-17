import { NextFunction, Request, Response } from "express";
import { my_db, my_url } from "@app_root/core/helpers";

const mw_bind_app_data = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.app_data = {
    auth: { is_system_owner: false, is_organization_owner: false },
    db_connection: await my_db.connect_to_db("app_main_db"),
    maca: req.get("app-maca")?.trim() || "",
    subdomain: my_url.get_subdomain(req),
    useragent: {
      browser: req.useragent?.browser,
      os: req.useragent?.os,
      platform: req.useragent?.platform,
      source: req.useragent?.source,
      version: req.useragent?.version
    },
    validation_data: {}
  };

  return next();
};

export { mw_bind_app_data };
