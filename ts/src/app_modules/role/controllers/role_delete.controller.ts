import { Request } from "express";
import { TController } from "@app_root/core/types";
import { my_db } from "@app_root/core/helpers";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { role_view_validator } from "@app_root/app_modules/role/validators/role_view.validator";

const role_delete_controller: TController = {
  method: "delete",
  route_path: "/:_id",
  middlewares: [mw_validator(role_view_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      )
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const { validated_input_data } = req.app_data.validation_data;

    const query_role: Record<string, unknown> = {};
    if (validated_input_data?._id) {
      query_role._id = validated_input_data._id;
    }

    if (!query_role._id) {
      return { _data: null };
    }

    const query_user_data = (await req.app_data.db_connection.models.user
      .findOne({ role: query_role._id })
      .select({ _id: 1 })
      .lean()
      .exec()) as Record<string, string>;
    if (query_user_data) {
      throw {
        _status: 403,
        _code: "assigned_role",
        _message: "Assigned roles cannot be removed."
      };
    }

    if (req.app_data.auth.organization?.toString().trim()) {
      query_role.organization = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }

    await req.app_data.db_connection.models.role
      .findOneAndDelete(query_role)
      .select({ _id: 1 })
      .lean()
      .exec();

    return { _message: "Role deleted successfully." };
  }
};

export { role_delete_controller };
