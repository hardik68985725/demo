import { Request } from "express";
import { hashSync } from "bcrypt";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { myUTC } from "@app_root/core/helpers";
import { user_set_password_validator } from "@app_root/app_modules/user/validators/user_set_password.validator";

const user_set_password_controller: TController = {
  method: "post",
  routePath: "/set_password",
  isAuthRequired: false,
  middlewares: [mw_validator(user_set_password_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryUserData =
      await req.appData.dbConnection!.collections.users.findOne(
        { "set_password_token.token": validatedInputData.set_password_token },
        { projection: { _id: 1, set_password_token: 1 } }
      );
    if (
      !queryUserData ||
      myUTC() <
        myUTC(queryUserData?.set_password_token?.created_at).plus({
          milliseconds: parseInt(
            process.env.RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS!,
            10
          )
        })
    ) {
      throw {
        _status: 400,
        _code: "invalid_or_expired",
        _message: "Link is invalid or expired."
      };
    }

    await req.appData.dbConnection!.collections.users.updateOne(
      { _id: queryUserData._id },
      {
        $set: {
          password: hashSync(
            validatedInputData.password,
            parseInt(process.env.HASH_SALT_ROUNDS!, 10)
          )
        },
        $unset: { set_password_token: 1 }
      }
    );

    return { _message: "Password set successfully." };
  }
};

export { user_set_password_controller };
