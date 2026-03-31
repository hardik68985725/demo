import { Request, Response, NextFunction } from "express";
import { my_type } from "@app_root/core/helpers";

type TRoleMiddlewareOptions = {
  moduleName: string;
  permission: string;
  throwAnError?: boolean;
};

const mw_role = (options: TRoleMiddlewareOptions) => {
  const moduleName = String(options.moduleName ?? "").trim();
  const permission = String(options.permission ?? "").trim();
  const throwAnError = my_type.getBoolean(
    String(options.throwAnError ?? false).trim()
  );

  if (moduleName === "" || permission === "") {
    myLogger.error(
      "Enough options have not been passed to mw_role. moduleName and permission are required."
    );
    console.trace();

    process.exit(1);
  }

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.appData.auth.user!.organization?.isOwner) {
        if (!req.appData.auth.user?.role?.have_rights) {
          if (throwAnError) {
            throw { _status: 403, _code: "forbidden", _message: "No rights." };
          }

          req.appData.auth.user!.ownDataQuery = {
            created_by: req.appData.auth.user!._id
          };
        } else {
          const haveRights = req.appData.auth.user.role.have_rights as Record<
            string,
            string
          >;

          if (
            !haveRights[moduleName] ||
            !["write", permission].includes(haveRights[moduleName])
          ) {
            if (throwAnError) {
              throw {
                _status: 403,
                _code: "forbidden",
                _message: "All inactive."
              };
            }

            req.appData.auth.user!.ownDataQuery = {
              created_by: req.appData.auth.user!._id
            };
          }
        }
      }
    } catch (error) {
      return next(error);
    }
    return next();
  };
};

export { mw_role };
