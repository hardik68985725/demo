import { Request } from "express";
import { hashSync } from "bcryptjs";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_utc } from "@app_root/core/helpers";
import { user_set_password_validator } from "@app_root/app_modules/user/validators/user_set_password.validator";

const user_set_password_controller: TController = {
  method: "post",
  route_path: "/set_password",
  middlewares: [mw_validator(user_set_password_validator, true)],
  is_disabled: false,
  is_auth_required: false,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    const query_user_data = (await req.app_data.db_connection.models.user
      .findOne({
        "set_password_token.token": validated_input_data?.set_password_token
      })
      .select({ _id: 1, set_password_token: 1 })
      .lean()
      .exec()) as Record<string, any>;
    if (
      !(
        query_user_data &&
        !my_utc().isSameOrAfter(
          my_utc(query_user_data?.set_password_token?.created_at).add(
            process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS,
            "ms"
          )
        )
      )
    ) {
      throw {
        _status: 400,
        _code: "not_exists",
        _message: "Link is invalid or expired."
      };
    }

    await req.app_data.db_connection.models.user
      .findByIdAndUpdate(query_user_data._id, {
        password: hashSync(
          validated_input_data?.password,
          parseInt(process.env.HASH_SALT_ROUNDS as string, 10)
        ),
        $unset: { set_password_token: 1 }
      })
      .exec();

    return { _message: "Password set successfully." };
  }
};

export { user_set_password_controller };
