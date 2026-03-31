import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { role_update_validator } from "@app_root/app_modules/role/validators/role_update.validator";
import { my_db } from "@app_root/core/helpers";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const role_update_controller: TController = {
  method: "patch",
  routePath: "/:_id",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Write
    }),
    mw_validator(role_update_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryRole = {
      ...req.appData.auth.user!.ownDataQuery,
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    };

    const queryRoleDataById =
      await req.appData.dbConnection!.collections.roles.findOne(queryRole, {
        projection: { _id: 1 }
      });
    if (!queryRoleDataById?._id?.toString().trim()) {
      throw {
        _status: 403,
        _code: "invalid_role",
        _message: "Role is invalid."
      };
    }

    const queryRoleDataByName =
      await req.appData.dbConnection!.collections.roles.findOne(
        { name: my_db.getRegexFieldForAggregation(validatedInputData.name) },
        { projection: { _id: 1 } }
      );
    if (queryRoleDataByName) {
      if (
        !new my_db.mongodbObjectId(queryRoleDataByName._id).equals(
          queryRoleDataById._id
        )
      ) {
        throw {
          _status: 400,
          _code: "already_exists",
          _message: `${validatedInputData.name} is already exists.`
        };
      }
    }

    await req.appData.dbConnection!.collections.roles.updateOne(
      { _id: queryRole._id! },
      {
        $set: {
          name: validatedInputData.name,
          have_rights: validatedInputData.have_rights
        }
      }
    );

    return { _message: "Role updated successfully." };
  }
};

export { role_update_controller };
