import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { role_view_validator } from "@app_root/app_modules/role/validators/role_view.validator";
import { my_db } from "@app_root/core/helpers";

const role_view_controller: TController = {
  method: "get",
  route_path: "/view/:_id?",
  middlewares: [mw_validator(role_view_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    const query_role: Record<string, unknown> = {};
    if (validated_input_data?._id) {
      query_role._id = validated_input_data._id;
    }

    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      )
    ) {
      if (req.app_data.auth.role?._id) {
        query_role._id = req.app_data.auth.role._id;
      }
    }

    if (!query_role._id) {
      return { _data: null };
    }

    if (req.app_data.auth.organization?.toString().trim()) {
      query_role.organization = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }

    const query_role_data = (await req.app_data.db_connection.models.role
      .findOne(query_role)
      .select({ _id: 1, name: 1, have_rights: 1 })
      .lean()
      .exec()) as Record<string, string>;

    return { _data: query_role_data };
  }
};

export { role_view_controller };
