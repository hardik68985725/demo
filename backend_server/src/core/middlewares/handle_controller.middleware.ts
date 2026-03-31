import { Request, Response, NextFunction } from "express";
import { my_db, my_type } from "@app_root/core/helpers";

const mw_handle_controller = (controller: Function) => {
  // Return a middleware function of controller.
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.appData.dbConnection) {
        req.appData.dbConnection = await my_db.connectToDb(process.env.DB_NAME);
      }

      // Called controller function and passed req object.
      const _return = await controller(req, res, next);
      res.locals.__response = my_type.isAnEmptyObject(_return)
        ? undefined
        : _return;
    } catch (error) {
      // Send an error.
      return next(error);
    }
    return next();
  };
};

export { mw_handle_controller };
