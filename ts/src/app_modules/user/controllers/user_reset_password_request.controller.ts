import { Request } from "express";
import { hashSync } from "bcryptjs";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { utility, my_utc, my_ejs, my_nodemailer } from "@app_root/core/helpers";
import { user_reset_password_request_validator } from "@app_root/app_modules/user/validators/user_reset_password_request.validator";

const user_reset_password_request_controller: TController = {
  method: "post",
  route_path: "/reset_password_request",
  middlewares: [mw_validator(user_reset_password_request_validator, true)],
  is_disabled: false,
  is_auth_required: false,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    const query_user_data = (await req.app_data.db_connection.models.user
      .findOne({ email: validated_input_data?.email })
      .select({ _id: 1, set_password_token: 1 })
      .lean()
      .exec()) as Record<string, any>;
    if (!query_user_data) {
      throw {
        _status: 400,
        _code: "not_exists",
        _message: "Email does not exists."
      };
    }

    if (
      query_user_data?.set_password_token?.created_at &&
      !my_utc().isSameOrAfter(
        my_utc(query_user_data?.set_password_token?.created_at).add(
          process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS,
          "ms"
        )
      )
    ) {
      throw {
        _status: 400,
        _code: "request_limit",
        _message:
          "You can request after an hour from the last request to set the password."
      };
    }

    const update_user_data = {
      set_password_token: {
        created_at: new Date(),
        token: hashSync(
          utility.get_random_password(),
          parseInt(process.env.HASH_SALT_ROUNDS as string, 10)
        )
      }
    };
    await req.app_data.db_connection.models.user
      .findByIdAndUpdate(query_user_data._id, update_user_data)
      .exec();

    // SEND AN EMAIL
    const email_subject = "Demo - Reset Password";
    const signin_url = (process.env.PROJECT_PUBLIC_URL as string)
      .toString()
      .trim()
      .split("//")
      .join("//".concat(req.app_data.subdomain, "."));
    const set_password_url = signin_url.concat(
      "/user/set-password?_spt=",
      update_user_data.set_password_token.token
    );
    const email_content = await my_ejs.render_email_template(
      "reset_password_request.ejs",
      email_subject,
      { set_password_url }
    );
    if (email_content) {
      await my_nodemailer.send_an_email(
        validated_input_data?.email,
        email_subject,
        email_content
      );
    }
    // /SEND AN EMAIL

    return { _message: "Check your email inbox to set the password." };
  }
};

export { user_reset_password_request_controller };
