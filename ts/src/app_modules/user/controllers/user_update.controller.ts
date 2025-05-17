import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_update_validator } from "@app_root/app_modules/user/validators/user_update.validator";
import { my_db } from "@app_root/core/helpers";

const user_update_controller: TController = {
  method: "patch",
  route_path: "/:_id",
  middlewares: [mw_validator(user_update_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      )
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    if (
      new my_db.mongodb_objectid(validated_input_data?._id as string).equals(
        req.app_data.auth.created_by
      )
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const query_role: Record<string, unknown> = {};
    query_role._id = validated_input_data?.role;
    query_role.organization = undefined;
    if (req.app_data.auth.organization?.toString().trim()) {
      query_role.organization = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }
    const query_role_data = (await req.app_data.db_connection.models.role
      .findOne(query_role)
      .select({ _id: 1 })
      .lean()
      .exec()) as Record<string, string>;
    if (!query_role_data) {
      throw { _status: 403, _code: "not_exists", _message: "Role is invalid" };
    }

    const query_user: Record<string, unknown> = {};
    query_user._id = validated_input_data?._id;
    query_user.organization = undefined;
    if (req.app_data.auth.organization?.toString().trim()) {
      query_user.organization = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }
    await req.app_data.db_connection.models.user
      .findOneAndUpdate(query_user, {
        updated_by: req.app_data.auth.created_by,
        role: validated_input_data?.role
      })
      .exec();

    return { _message: "User updated successfully." };
  }
};

export { user_update_controller };
