import { Request } from "express";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_db, my_type, myUTC } from "@app_root/core/helpers";
import { role_create_validator } from "@app_root/app_modules/role/validators/role_create.validator";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const role_create_controller: TController = {
  method: "post",
  routePath: "/",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Write
    }),
    mw_validator(role_create_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    // Remove inactive permission modules.
    if (!my_type.isAnEmptyObject(validatedInputData.have_rights)) {
      for (const key in validatedInputData.have_rights) {
        if (
          validatedInputData.have_rights[key] ===
          RoleEnums.EPermissionNames.Inactive
        ) {
          delete validatedInputData.have_rights[key];
        }
      }
    }

    if (my_type.isAnEmptyObject(validatedInputData.have_rights)) {
      delete validatedInputData.have_rights;
    }
    // /Remove inactive permission modules.

    const queryRoleData =
      await req.appData.dbConnection!.collections.roles.findOne(
        {
          created_by: req.appData.auth.user!._id,
          name: my_db.getRegexFieldForAggregation(validatedInputData.name)
        },
        { projection: { _id: 1 } }
      );
    if (queryRoleData?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validatedInputData.name} is already exists.`
      };
    }

    const newRole: TDocumentOrQuery = {
      created_at: myUTC().toJSDate(),
      created_by: req.appData.auth.user!._id,
      organization: new my_db.mongodbObjectId(
        req.appData.auth.user!.organization!._id
      ),
      name: validatedInputData.name
    };
    if (validatedInputData.have_rights) {
      newRole.have_rights = validatedInputData.have_rights;
    }
    await req.appData.dbConnection!.collections.roles.insertOne(newRole);

    return { _message: "Role created successfully." };
  }
};

export { role_create_controller };
