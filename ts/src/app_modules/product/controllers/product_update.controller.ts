import { join } from "node:path";
import { unlinkSync } from "node:fs";
import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { mw_multipart_formdata } from "@app_root/core/middlewares/multipart_formdata.middleware";
import { product_update_validator } from "@app_root/app_modules/product/validators/product_update.validator";
import { my_db } from "@app_root/core/helpers";
import {
  upload_file,
  get_file_url,
  delete_file
} from "@app_root/core/helpers/my_aws/my_aws_s3_bucket.helper";

const product_update_controller: TController = {
  method: "patch",
  route_path: "/:_id",
  middlewares: [
    mw_role("product", "write"),
    mw_multipart_formdata("image", "product_test"),
    mw_validator(product_update_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data, uploaded_file_list } =
      req.app_data.validation_data;

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
    if (
      query_product_by_name_data &&
      query_product_by_name_data?._id?.toString().trim() !==
        validated_input_data?._id?.toString().trim()
    ) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validated_input_data?.name} is already exists.`
      };
    }

    let product_image: undefined | Record<string, unknown> = undefined;
    if (uploaded_file_list && uploaded_file_list.length) {
      let to_bucket: string = "system";
      if (organization_id) {
        to_bucket = organization_id.toString().trim();
      }

      const query_product_data =
        (await req.app_data.db_connection.models.product
          .findById(validated_input_data?._id?.toString().trim())
          .select({ "image.filename": 1 })
          .lean()
          .exec()) as Record<string, Record<string, string>>;
      if (
        query_product_data &&
        query_product_data.image &&
        query_product_data.image.filename
      ) {
        await delete_file({
          store_at: join(to_bucket, "product"),
          filename: query_product_data.image.filename
        });
      }

      product_image = {
        filename: uploaded_file_list[0].filename,
        originalname: uploaded_file_list[0].originalname,
        mimetype: uploaded_file_list[0].mimetype,
        size: uploaded_file_list[0].size,
        s3_bucket: {}
      };

      await upload_file({
        store_at: join(to_bucket, "product"),
        filename: product_image.filename as string
      });

      unlinkSync(
        join(
          process.env.MEDIA_UPLOAD_DIRECTORY as string,
          product_image.filename as string
        )
      );

      product_image.s3_bucket = {
        created_at: new Date(),
        url: await get_file_url({
          store_at: join(to_bucket, "product"),
          filename: product_image.filename as string
        })
      };
    }

    await req.app_data.db_connection.models.product.findByIdAndUpdate(
      validated_input_data?._id?.toString().trim(),
      {
        update_by: req.app_data.auth.created_by,
        group: validated_input_data?.group,
        name: validated_input_data?.name,
        color: validated_input_data?.color,
        price: validated_input_data?.price,
        quarantine: validated_input_data?.quarantine,
        duration: validated_input_data?.duration,
        tolerance: validated_input_data?.tolerance,
        image: product_image
      }
    );

    return { _message: "Product updated successfully." };
  }
};

export { product_update_controller };
