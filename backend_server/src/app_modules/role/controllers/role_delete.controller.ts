import { Request } from "express";
import { TController } from "@app_root/core/types";
import { my_db } from "@app_root/core/helpers";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { role_view_validator } from "@app_root/app_modules/role/validators/role_view.validator";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const role_delete_controller: TController = {
  method: "delete",
  routePath: "/:_id",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Write
    }),
    mw_validator(role_view_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryRole = {
      ...req.appData.auth.user!.ownDataQuery,
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    };

    const queryUserData =
      await req.appData.dbConnection!.collections.users.findOne(
        { role: queryRole._id },
        { projection: { _id: 1 } }
      );
    if (queryUserData) {
      throw {
        _status: 403,
        _code: "assigned_role",
        _message: "Assigned roles cannot be removed."
      };
    }

    await req.appData.dbConnection!.collections.roles.deleteOne(queryRole);

    return { _message: "Role deleted successfully." };
  }
};

export { role_delete_controller };
