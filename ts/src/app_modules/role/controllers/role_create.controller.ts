import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_db } from "@app_root/core/helpers";
import { role_create_validator } from "@app_root/app_modules/role/validators/role_create.validator";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const role_create_controller: TController = {
  method: "post",
  route_path: "/",
  middlewares: [mw_validator(role_create_validator, true)],
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
    // REMOVE INACTIVE PERMISSION MODULES.
    if (
      validated_input_data?.have_rights &&
      Object.keys(validated_input_data?.have_rights).length > 0
    ) {
      for (const key in validated_input_data?.have_rights) {
        if (
          validated_input_data?.have_rights[key] ===
          RoleEnums.EPermissionNames.Inactive
        ) {
          delete validated_input_data?.have_rights[key];
        }
      }
    }

    if (
      !(
        validated_input_data?.have_rights &&
        Object.keys(validated_input_data?.have_rights).length > 0
      )
    ) {
      delete validated_input_data?.have_rights;
    }
    // /REMOVE INACTIVE PERMISSION MODULES.

    const query_role_data = (await req.app_data.db_connection.models.role
      .findOne({
        organization: req.app_data.auth.organization?.toString().trim(),
        name: my_db.get_regex_field_for_aggregation(validated_input_data?.name)
      })
      .select({ _id: 1, organization: 1 })
      .lean()
      .exec()) as Record<string, string>;
    if (query_role_data?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.name} is already exists.`
      };
    }

    const new_role_data: Record<string, string> = {
      created_by: req.app_data.auth.created_by,
      name: validated_input_data?.name,
      have_rights: validated_input_data?.have_rights
    };
    if (req.app_data.auth.is_organization_owner) {
      new_role_data.organization = req.app_data.auth.organization;
    }

    await req.app_data.db_connection.models.role.insertMany(new_role_data);

    return { _message: "Role created successfully." };
  }
};

export { role_create_controller };
