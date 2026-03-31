import { Request } from "express";
import { hashSync } from "bcrypt";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { utility, myUTC } from "@app_root/core/helpers";
import { user_reset_password_request_validator } from "@app_root/app_modules/user/validators/user_reset_password_request.validator";

const user_reset_password_request_controller: TController = {
  method: "post",
  routePath: "/reset_password_request",
  middlewares: [mw_validator(user_reset_password_request_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryUserData =
      await req.appData.dbConnection!.collections.users.findOne(
        { email: validatedInputData.email },
        { projection: { _id: 1, set_password_token: 1 } }
      );
    if (!queryUserData) {
      throw {
        _status: 400,
        _code: "not_exists",
        _message: "Email does not exists."
      };
    }

    if (
      queryUserData.set_password_token?.created_at &&
      myUTC() <
        myUTC(queryUserData.set_password_token?.created_at).plus({
          milliseconds: parseInt(
            process.env.RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS!,
            10
          )
        })
    ) {
      throw {
        _status: 400,
        _code: "request_limit",
        _message:
          "You can request after an hour from the last request to set the password."
      };
    }

    const updateUserData = {
      set_password_token: {
        created_at: myUTC().toJSDate(),
        token: hashSync(
          utility.getRandomPassword(),
          parseInt(process.env.HASH_SALT_ROUNDS!, 10)
        )
      }
    };
    await req.appData.dbConnection!.collections.users.updateOne(
      { _id: queryUserData._id },
      { $set: updateUserData }
    );

    return { _message: "Check your email inbox to set the password." };
  }
};

export { user_reset_password_request_controller };
