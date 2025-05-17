import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { product_status_change_validator } from "@app_root/app_modules/product/validators/product_status_change.validator";

const product_status_change_controller: TController = {
  method: "patch",
  route_path: "/:organization/status",
  middlewares: [mw_validator(product_status_change_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.is_system_owner) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }
    const { validated_input_data } = req.app_data.validation_data;

    if (validated_input_data?.products?.length) {
      await req.app_data.db_connection.models.product.updateMany(
        {
          organization: validated_input_data?.organization,
          _id: { $in: validated_input_data?.products }
        },
        { status: validated_input_data?.status }
      );
    }

    return { _message: "Status updated successfully." };
  }
};

export { product_status_change_controller };
