import { Request } from "express";
import { compareSync, hashSync } from "bcryptjs";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_update_profile_validator } from "@app_root/app_modules/user/validators/user_update_profile.validator";

const user_update_profile_controller: TController = {
  method: "patch",
  route_path: "/profile/update",
  middlewares: [mw_validator(user_update_profile_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    const query_user_data = (await req.app_data.db_connection.models.user
      .findOne({ _id: req.app_data.auth.created_by })
      .select({ password: 1 })
      .lean()
      .exec()) as Record<string, string>;
    if (!(query_user_data && query_user_data.password)) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials"
      };
    }

    const is_password_ok = compareSync(
      validated_input_data?.password,
      query_user_data.password
    );
    if (!is_password_ok) {
      throw {
        _status: 400,
        _code: "invalid_credentials",
        _message: "Invalid credentials"
      };
    }

    const update_user_data: Record<string, string> = {
      updated_by: req.app_data.auth.created_by,
      mobile_phone_number: validated_input_data?.mobile_phone_number,
      name: validated_input_data?.name,
      birth_date: validated_input_data?.birth_date,
      gender: validated_input_data?.gender,
      address: validated_input_data?.address
    };
    if (validated_input_data?.new_password) {
      update_user_data.password = hashSync(
        validated_input_data?.new_password,
        parseInt(process.env.HASH_SALT_ROUNDS as string, 10)
      );
    }

    await req.app_data.db_connection.models.user.updateMany(
      { _id: req.app_data.auth.created_by },
      update_user_data
    );

    return { _message: "Updated successfully." };
  }
};

export { user_update_profile_controller };
