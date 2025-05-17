import { join } from "node:path";
import { unlinkSync } from "node:fs";
import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_multipart_formdata } from "@app_root/core/middlewares/multipart_formdata.middleware";
import { my_db } from "@app_root/core/helpers";
import {
  get_file_url,
  upload_file
} from "@app_root/core/helpers/my_aws/my_aws_s3_bucket.helper";
import { product_create_validator } from "@app_root/app_modules/product/validators/product_create.validator";
import { ProductEnums } from "@app_root/app_modules/product/enums";

const product_create_controller: TController = {
  method: "post",
  route_path: "/",
  middlewares: [
    mw_role("product", "write"),
    mw_multipart_formdata("image", "product_test"),
    mw_validator(product_create_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data, uploaded_file_list } =
      req.app_data.validation_data;

    if (!(uploaded_file_list && uploaded_file_list.length)) {
      throw {
        _status: 400,
        _code: "required_image",
        _message: "Product image is required."
      };
    }

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

    const group_data = await req.app_data.db_connection.models.group
      .findOne({
        organization: organization_id,
        _id: validated_input_data?.group
      })
      .lean()
      .exec();
    if (!group_data) {
      throw {
        _status: 400,
        _code: "not_exists",
        _message: "Group is invalid."
      };
    }

    const query_product_by_name_data =
      (await req.app_data.db_connection.models.product
        .findOne({
          organization: req.app_data.auth.organization?.toString().trim(),
          name: my_db.get_regex_field_for_aggregation(
            validated_input_data?.name
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (query_product_by_name_data?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.name} is already exists.`
      };
    }

    const product_image = {
      filename: uploaded_file_list[0].filename,
      originalname: uploaded_file_list[0].originalname,
      mimetype: uploaded_file_list[0].mimetype,
      size: uploaded_file_list[0].size,
      s3_bucket: {}
    };

    let to_bucket: string = "system";
    let product_status = ProductEnums.EStatus.Approved;
    if (req.app_data.auth.organization?.toString().trim()) {
      to_bucket = req.app_data.auth.organization?.toString().trim();
      product_status = ProductEnums.EStatus.Pending;
    }

    await upload_file({
      store_at: join(to_bucket, "product"),
      filename: product_image.filename
    });

    unlinkSync(
      join(process.env.MEDIA_UPLOAD_DIRECTORY as string, product_image.filename)
    );

    product_image.s3_bucket = {
      created_at: new Date(),
      url: await get_file_url({
        store_at: join(to_bucket, "product"),
        filename: product_image.filename
      })
    };

    await req.app_data.db_connection.models.product.insertMany({
      created_by: req.app_data.auth.created_by,
      organization: organization_id,
      status: product_status,
      group: validated_input_data?.group,
      name: validated_input_data?.name,
      color: validated_input_data?.color,
      price: validated_input_data?.price,
      quarantine: validated_input_data?.quarantine,
      duration: validated_input_data?.duration,
      tolerance: validated_input_data?.tolerance,
      image: product_image
    });

    return { _message: "Product created successfully." };
  }
};

export { product_create_controller };
