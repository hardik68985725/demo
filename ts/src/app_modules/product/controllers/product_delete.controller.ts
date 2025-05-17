import { join } from "node:path";
import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { product_view_validator } from "@app_root/app_modules/product/validators/product_view.validator";
import { my_db } from "@app_root/core/helpers";
import { delete_file } from "@app_root/core/helpers/my_aws/my_aws_s3_bucket.helper";

const product_delete_controller: TController = {
  method: "delete",
  route_path: "/:_id",
  middlewares: [
    mw_role("product", "write"),
    mw_validator(product_view_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    let organization_id = undefined;
    if (req.app_data.auth.organization?.toString().trim()) {
      organization_id = new my_db.mongodb_objectid(
        (req.app_data.auth.organization as string)?.toString().trim()
      );
    } else if (
      req.query.organization &&
      req.query.organization.toString().trim()
    ) {
      organization_id = new my_db.mongodb_objectid(
        (req.query.organization as string)?.toString().trim()
      );
    }

    const query_plu_data = (await req.app_data.db_connection.models.plu
      .findOne({
        organization: organization_id,
        product: validated_input_data?._id
      })
      .lean()
      .exec()) as Record<string, Record<string, string>>;
    if (query_plu_data) {
      throw {
        _status: 403,
        _code: "assigned_product",
        _message: "Used product cannot be removed."
      };
    }

    const query_deleted_product_data =
      (await req.app_data.db_connection.models.product
        .findOneAndDelete({
          organization: organization_id,
          _id: validated_input_data?._id
        })
        .lean()
        .exec()) as Record<string, Record<string, string>>;
    if (!query_deleted_product_data) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    let to_bucket: string = "system";
    if (organization_id) {
      to_bucket = organization_id.toString().trim();
    }
    await delete_file({
      store_at: join(to_bucket, "product"),
      filename: query_deleted_product_data.image.filename
    });

    return { _message: "Product deleted successfully." };
  }
};

export { product_delete_controller };
