import { Request } from "express";
import { hashSync } from "bcrypt";
import { my_db, myUTC, utility } from "@app_root/core/helpers";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_create_validator } from "@app_root/app_modules/user/validators/user_create.validator";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const user_create_controller: TController = {
  method: "post",
  routePath: "/",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.User,
      permission: RoleEnums.EPermissionNames.Write
    }),
    mw_validator(user_create_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryUserData =
      await req.appData.dbConnection!.collections.users.findOne(
        { email: validatedInputData.email },
        { projection: { _id: 1 } }
      );
    if (queryUserData?._id) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validatedInputData.email} is already exists.`
      };
    }

    const queryRoleData =
      await req.appData.dbConnection!.collections.roles.findOne(
        { _id: new my_db.mongodbObjectId(validatedInputData.role as string) },
        { projection: { _id: 1 } }
      );
    if (!queryRoleData?._id) {
      throw { _status: 403, _code: "not_exists", _message: "Role is invalid." };
    }

    const newUserData: TDocumentOrQuery = {
      created_at: myUTC().toJSDate(),
      created_by: req.appData.auth.user!._id,
      organization: req.appData.auth.user!.organization!
        ._id as my_db.mongodbObjectId,
      role: queryRoleData?._id,
      email: validatedInputData.email,
      name: validatedInputData.name,
      set_password_token: {
        created_at: myUTC().toJSDate(),
        token: hashSync(
          utility.getRandomPassword(),
          parseInt(process.env.HASH_SALT_ROUNDS!, 10)
        )
      }
    };
    await req.appData.dbConnection!.collections.users.insertOne(newUserData);

    return {
      _message: `User has been created successfully with an email address ${validatedInputData.email}.`
    };
  }
};

export { user_create_controller };
