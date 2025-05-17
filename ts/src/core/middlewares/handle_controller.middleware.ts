import { Request, Response, NextFunction, Router } from "express";
import { my_type } from "@app_root/core/helpers";

const mw_handle_controller = (_controller: Router) => {
  // RETURN A MIDDLEWARE FUNCTION OF CONTROLLER.
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // CALLED CONTROLLER FUNCTION AND PASSED req OBJECT.
      const _return = await _controller(req, res, next);
      res.locals.__response = my_type.is_an_empty_object(_return)
        ? undefined
        : _return;
    } catch (error) {
      // SEND ERROR
      return next(error);
    }
    return next();
  };
};
export { mw_handle_controller };
