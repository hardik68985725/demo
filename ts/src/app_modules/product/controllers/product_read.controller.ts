import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { my_type, my_db, utility } from "@app_root/core/helpers";
import { update_and_get_product_image_file_url } from "@app_root/app_modules/product/services/update_and_get_product_image_file_url.service";

const product_read_controller: TController = {
  method: "get",
  route_path: "/",
  middlewares: [mw_role("product", "read")],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const pipeline_pagination = my_db.get_pagination_pipeline({
      page_no: req.query.page_no as unknown as number,
      rows_per_page: req.query.rows_per_page as unknown as number,
      data_list_field_name: "product_list"
    });

    const pipeline_match_search: Array<PipelineStage> = [];

    if (req.app_data.auth.organization?.toString().trim()) {
      if (req.query.organization?.toString().trim() === "") {
        pipeline_match_search[pipeline_match_search.length] = {
          $match: { organization: undefined }
        };
      } else {
        pipeline_match_search[pipeline_match_search.length] = {
          $match: {
            organization: new my_db.mongodb_objectid(
              req.app_data.auth.organization as string
            )
          }
        };
      }
    } else if (
      req.query.organization &&
      req.query.organization.toString().trim()
    ) {
      pipeline_match_search[pipeline_match_search.length] = {
        $match: {
          organization: new my_db.mongodb_objectid(
            req.query.organization as string
          )
        }
      };
    } else {
      pipeline_match_search[pipeline_match_search.length] = {
        $match: { organization: undefined }
      };
    }

    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipeline_match_search[pipeline_match_search.length] = {
        $match: {
          $or: [
            {
              name: my_db.get_regex_field_for_aggregation(
                req.query.search_text.toString(),
                false
              )
            }
          ]
        }
      };
    }

    (req.query.is_for_autocomplete as unknown as boolean) = my_type.get_boolean(
      req.query?.is_for_autocomplete?.toString()
    );

    const pipeline_lookup_of_group: Array<PipelineStage> = [];
    if (!req.query.is_for_autocomplete) {
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
    }

    const pipeline_project_final: Array<PipelineStage> = [];
    if (!req.query.is_for_autocomplete) {
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
    } else {
      pipeline_project_final[pipeline_project_final.length] = {
        $project: { _id: 1, name: 1 }
      };
    }

    const query_product_aggregation = [
      ...pipeline_match_search,
      ...pipeline_lookup_of_group,
      ...pipeline_project_final,
      ...pipeline_pagination
    ];
    const query_product_data = (
      await req.app_data.db_connection.models.product
        .aggregate(query_product_aggregation)
        .exec()
    )[0];
    if (my_type.is_an_empty_object(query_product_data)) {
      return { _data: null };
    }

    if (!req.query.is_for_autocomplete) {
      if (
        query_product_data.product_list &&
        Array.isArray(query_product_data.product_list) &&
        query_product_data.product_list.length
      ) {
        for (const v_product of query_product_data.product_list) {
          if (!v_product.color) {
            v_product.color = utility.get_random_color();
          }
        }
      }

      await update_and_get_product_image_file_url(
        req,
        query_product_data.product_list
      );
    }

    return { _data: query_product_data };
  }
};

export { product_read_controller };
