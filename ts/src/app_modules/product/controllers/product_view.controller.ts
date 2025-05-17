import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { product_view_validator } from "@app_root/app_modules/product/validators/product_view.validator";
import { my_db, my_type, utility } from "@app_root/core/helpers";
import { update_and_get_product_image_file_url } from "@app_root/app_modules/product/services/update_and_get_product_image_file_url.service";

const product_view_controller: TController = {
  method: "get",
  route_path: "/:_id",
  middlewares: [
    mw_role("product", "read"),
    mw_validator(product_view_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    const pipeline_match: Array<PipelineStage> = [];
    pipeline_match[0] = {
      $match: {
        _id: new my_db.mongodb_objectid(validated_input_data?._id as string)
      }
    };

    if (req.app_data.auth.organization?.toString().trim()) {
      pipeline_match[pipeline_match.length] = {
        $match: {
          organization: new my_db.mongodb_objectid(
            req.app_data.auth.organization as string
          )
        }
      };
    } else if (
      req.query.organization &&
      req.query.organization.toString().trim()
    ) {
      pipeline_match[pipeline_match.length] = {
        $match: {
          organization: new my_db.mongodb_objectid(
            req.query.organization as string
          )
        }
      };
    } else {
      pipeline_match[pipeline_match.length] = {
        $match: { organization: undefined }
      };
    }

    const pipeline_lookup_of_group: Array<PipelineStage> = [];
    pipeline_lookup_of_group[pipeline_lookup_of_group.length] = {
      $lookup: {
        from: "groups",
        localField: "group",
        foreignField: "_id",
        as: "group",
        pipeline: [{ $project: { _id: 1, name: 1 } }]
      }
    };
    pipeline_lookup_of_group[pipeline_lookup_of_group.length] = {
      $unwind: { path: "$group", preserveNullAndEmptyArrays: true }
    };

    const pipeline_project_final: Array<PipelineStage> = [];
    pipeline_project_final[pipeline_project_final.length] = {
      $project: {
        _id: 1,
        name: 1,
        color: 1,
        quarantine: 1,
        duration: 1,
        tolerance: 1,
        limit: 1,
        group: 1,
        price: 1,
        status: 1,
        image: { filename: 1, originalname: 1, s3_bucket: 1 }
      }
    };

    const query_product_aggregation = [
      ...pipeline_match,
      ...pipeline_lookup_of_group,
      ...pipeline_project_final
    ];
    const query_product_data = (
      await req.app_data.db_connection.models.product
        .aggregate(query_product_aggregation)
        .exec()
    )[0];
    if (my_type.is_an_empty_object(query_product_data)) {
      return { _data: null };
    }

    if (query_product_data) {
      if (!query_product_data.color) {
        query_product_data.color = utility.get_random_color();
      }

      await update_and_get_product_image_file_url(req, [query_product_data]);
    }

    return { _data: query_product_data };
  }
};

export { product_view_controller };
