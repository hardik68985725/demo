import { join } from "node:path";
import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { product_view_validator } from "@app_root/app_modules/product/validators/product_view.validator";
import { my_db } from "@app_root/core/helpers";
import {
  copy_file,
  get_file_url
} from "@app_root/core/helpers/my_aws/my_aws_s3_bucket.helper";
import { ProductEnums } from "@app_root/app_modules/product/enums";

const product_clone_to_organization_controller: TController = {
  method: "post",
  route_path: "/:_id/clone_to_organization",
  middlewares: [
    mw_role("product", "write"),
    mw_validator(product_view_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.organization?.toString().trim()) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }
    const { validated_input_data } = req.app_data.validation_data;

    const query_system_product_data =
      (await req.app_data.db_connection.models.product
        .findOne({ organization: undefined, _id: validated_input_data?._id })
        .select({
          _id: 1,
          group: 1,
          name: 1,
          price: 1,
          color: 1,
          quarantine: 1,
          duration: 1,
          tolerance: 1,
          image: 1
        })
        .lean()
        .exec()) as Record<string, unknown>;
    if (!query_system_product_data) {
      throw {
        _status: 400,
        _code: "not_exists",
        _message: "Product is invalid."
      };
    }
    if (
      !(query_system_product_data.image as Record<string, string>)?.filename
        .toString()
        .trim()
    ) {
      throw {
        _status: 400,
        _code: "image_is_not_exists",
        _message: "Sorry, right now, this product is not cloneable."
      };
    }

    const query_system_group_data =
      (await req.app_data.db_connection.models.group
        .findOne({
          organization: undefined,
          _id: query_system_product_data.group
        })
        .select({ _id: 1, name: 1 })
        .lean()
        .exec()) as Record<string, unknown>;

    const query_organization_product_data =
      (await req.app_data.db_connection.models.product
        .findOne({
          organization: req.app_data.auth.organization?.toString().trim(),
          name: my_db.get_regex_field_for_aggregation(
            (query_system_product_data.name as string).toString()
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    if (query_organization_product_data) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: "Product is already exists."
      };
    }

    const query_organization_group_data =
      (await req.app_data.db_connection.models.product
        .findOne({
          organization: req.app_data.auth.organization?.toString().trim(),
          name: my_db.get_regex_field_for_aggregation(
            (query_system_group_data.name as string).toString().trim()
          )
        })
        .select({ _id: 1 })
        .lean()
        .exec()) as Record<string, string>;
    let query_new_organization_group_data: unknown =
      query_organization_group_data;
    if (!query_organization_group_data) {
      query_new_organization_group_data =
        await req.app_data.db_connection.models.group.insertMany({
          created_by: req.app_data.auth.created_by,
          organization: req.app_data.auth.organization,
          name: (query_system_group_data.name as string).toString().trim()
        });

      if ((query_new_organization_group_data as Array<unknown>).length > 0) {
        query_new_organization_group_data = (
          query_new_organization_group_data as Array<unknown>
        )[0];
      }
    }

    const destination = join(
      req.app_data.auth.organization?.toString().trim(),
      "product"
    );
    await copy_file({
      store_at: join("system", "product"),
      filename: (
        query_system_product_data.image as Record<string, string>
      )?.filename
        .toString()
        .trim(),
      destination: destination
    });

    const product_image = {
      filename: (query_system_product_data.image as Record<string, string>)
        .filename,
      originalname: (query_system_product_data.image as Record<string, string>)
        .originalname,
      encoding: (query_system_product_data.image as Record<string, string>)
        .encoding,
      mimetype: (query_system_product_data.image as Record<string, string>)
        .mimetype,
      size: (query_system_product_data.image as Record<string, string>).size,
      s3_bucket: {
        created_at: new Date(),
        url: await get_file_url({
          store_at: destination,
          filename: (query_system_product_data.image as Record<string, string>)
            .filename
        })
      }
    };

    let query_new_organization_product_data: unknown =
      await req.app_data.db_connection.models.product.insertMany({
        created_by: req.app_data.auth.created_by,
        organization: req.app_data.auth.organization,
        group: (query_new_organization_group_data as Record<string, string>)
          ._id,
        name: query_system_product_data.name as string,
        price: query_system_product_data.price as string,
        color: query_system_product_data.color as string,
        quarantine: query_system_product_data.quarantine as string,
        duration: query_system_product_data.duration as string,
        tolerance: query_system_product_data.tolerance as string,
        image: product_image,
        status: ProductEnums.EStatus.Approved
      });
    if ((query_new_organization_product_data as Array<unknown>).length > 0) {
      query_new_organization_product_data = (
        query_new_organization_product_data as Array<unknown>
      )[0];
    }

    const query_system_product_plu_data =
      (await req.app_data.db_connection.models.plu
        .find({
          organization: undefined,
          product: query_system_product_data._id
        })
        .select({ _id: 0, name: 1, code: 1 })
        .lean()
        .exec()) as Array<Record<string, string>>;
    if (query_system_product_plu_data.length > 0) {
      for (const v_plu of query_system_product_plu_data) {
        v_plu.created_by = req.app_data.auth.created_by;
        v_plu.organization = req.app_data.auth.organization;
        v_plu.product = (
          query_new_organization_product_data as Record<string, string>
        )._id;
      }

      await req.app_data.db_connection.models.plu.insertMany(
        query_system_product_plu_data
      );
    }

    return { _message: "Product cloned successfully." };
  }
};

export { product_clone_to_organization_controller };
