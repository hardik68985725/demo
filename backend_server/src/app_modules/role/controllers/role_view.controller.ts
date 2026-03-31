import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { role_view_validator } from "@app_root/app_modules/role/validators/role_view.validator";
import { my_db } from "@app_root/core/helpers";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const role_view_controller: TController = {
  method: "get",
  routePath: "/:_id",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Read
    }),
    mw_validator(role_view_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryRole = {
      ...req.appData.auth.user!.ownDataQuery,
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    };
    const queryRoleData =
      await req.appData.dbConnection!.collections.roles.findOne(queryRole, {
        projection: { _id: 1, name: 1, have_rights: 1 }
      });

    return { _data: queryRoleData };
  }
};

export { role_view_controller };
