import { Request } from "express";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_update_validator } from "@app_root/app_modules/user/validators/user_update.validator";
import { my_db } from "@app_root/core/helpers";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const user_update_controller: TController = {
  method: "patch",
  routePath: "/:_id",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Write
    }),
    mw_validator(user_update_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    if (
      new my_db.mongodbObjectId(validatedInputData._id as string).equals(
        req.appData.auth.user!._id
      )
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const queryRole: TDocumentOrQuery = { _id: validatedInputData.role };
    const queryRoleData =
      await req.appData.dbConnection!.collections.roles.findOne(queryRole, {
        projection: { _id: 1 }
      });
    if (!queryRoleData) {
      throw { _status: 403, _code: "not_exists", _message: "Role is invalid" };
    }

    const queryUser: TDocumentOrQuery = { _id: validatedInputData._id };
    await req.appData.dbConnection!.collections.users.updateOne(queryUser, {
      $set: {
        updated_by: req.appData.auth.user!._id,
        role: validatedInputData.role
      }
    });

    return { _message: "User updated successfully." };
  }
};

export { user_update_controller };
