import { Request, Response, NextFunction } from "express";

const mw_role = (
  _module_name: string,
  _permission: string,
  _is_throw_an_error: boolean = true
) => {
  // RETURN A MIDDLEWARE FUNCTION OF CONTROLLER.
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.app_data.auth.can_access = false;
      if (
        req.app_data.auth.role?.have_rights &&
        req.app_data.auth.role?.have_rights[_module_name] &&
        ["write", _permission].includes(
          req.app_data.auth.role?.have_rights[_module_name]
        )
      ) {
        req.app_data.auth.can_access = true;
      }

      if (_is_throw_an_error) {
        if (
          !(
            req.app_data.auth.is_system_owner ||
            req.app_data.auth.is_organization_owner ||
            req.app_data.auth.can_access
          )
        ) {
          throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
        }
      }
    } catch (error) {
      return next(error);
    }
    return next();
  };
};

export { mw_role };
