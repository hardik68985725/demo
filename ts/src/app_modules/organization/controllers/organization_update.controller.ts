import { Request } from "express";
import { hashSync } from "bcryptjs";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { organization_update_validator } from "@app_root/app_modules/organization/validators/organization_update.validator";
import { my_db } from "@app_root/core/helpers";

const organization_update_controller: TController = {
  method: "patch",
  route_path: "/:_id",
  middlewares: [
    mw_role("organization", "write"),
    mw_validator(organization_update_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    if (req.app_data.auth.organization && validated_input_data?._id) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const query_organization_by_id: Record<string, unknown> = {};
    if (validated_input_data?._id) {
      query_organization_by_id._id = validated_input_data._id;
    }

    if (req.app_data.auth.organization?.toString().trim()) {
      query_organization_by_id._id = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }

    if (!query_organization_by_id._id) {
      return { _data: null };
    }

    const query_organization_data_by_id =
      (await req.app_data.db_connection.models.organization
        .findById(query_organization_by_id._id)
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (!query_organization_data_by_id?._id?.toString().trim()) {
      throw {
        _status: 403,
        _code: "not_exists",
        _message: "Organization is invalid."
      };
    }

    const query_updated_organization_data =
      (await req.app_data.db_connection.models.organization
        .findByIdAndUpdate(
          query_organization_data_by_id._id,
          {
            updated_by: req.app_data.auth.created_by,
            name: validated_input_data?.name,
            address: validated_input_data?.address,
            business_day: validated_input_data?.business_day,
            timezone: validated_input_data?.timezone,
            currency: validated_input_data?.currency
          },
          { new: true }
        )
        .exec()) as Record<string, unknown>;

    const update_user_data: Record<string, string> = {
      updated_by: req.app_data.auth.created_by,
      name: validated_input_data?.owner.name,
      address: validated_input_data?.owner.address,
      mobile_phone_number: validated_input_data?.owner.mobile_phone_number
    };
    if (validated_input_data?.owner.password) {
      update_user_data.password = hashSync(
        validated_input_data.owner.password,
        parseInt(process.env.HASH_SALTROUNDS as string, 10)
      );
    }

    await req.app_data.db_connection.models.user
      .findByIdAndUpdate(
        (query_updated_organization_data?.owner as Record<string, string>)._id,
        update_user_data,
        { new: true }
      )
      .exec();

    return { _message: "Organization updated successfully." };
  }
};

export { organization_update_controller };
