import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { role_update_validator } from "@app_root/app_modules/role/validators/role_update.validator";
import { my_db } from "@app_root/core/helpers";

const role_update_controller: TController = {
  method: "patch",
  route_path: "/:_id",
  middlewares: [mw_validator(role_update_validator, true)],
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
    if (req.app_data.auth.organization?.toString().trim()) {
      query_role.organization = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }

    if (!query_role._id) {
      return { _data: null };
    }

    const query_role_data_by_id = (await req.app_data.db_connection.models.role
      .findOne(query_role)
      .select({ _id: 1 })
      .lean()
      .exec()) as Record<string, string>;
    if (!query_role_data_by_id?._id?.toString().trim()) {
      throw {
        _status: 403,
        _code: "invalid_role",
        _message: "Role is invalid."
      };
    }

    const query_role_data_by_name =
      (await req.app_data.db_connection.models.role
        .findOne({
          organization: req.app_data.auth.organization?.toString().trim(),
          name: my_db.get_regex_field_for_aggregation(
            validated_input_data?.name
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (query_role_data_by_name) {
      if (
        !new my_db.mongodb_objectid(query_role_data_by_name._id).equals(
          query_role_data_by_id._id
        )
      ) {
        throw {
          _status: 400,
          _code: "already_exists",
          _message: `${validated_input_data?.name} is already exists.`
        };
      }
    }

    await req.app_data.db_connection.models.role
      .findByIdAndUpdate(query_role._id, {
        updated_by: req.app_data.auth.created_by,
        name: validated_input_data?.name,
        have_rights: validated_input_data?.have_rights
      })
      .exec();

    return { _message: "Role updated successfully." };
  }
};

export { role_update_controller };
