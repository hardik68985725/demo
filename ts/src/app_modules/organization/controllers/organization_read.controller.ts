import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { my_db, my_type } from "@app_root/core/helpers";

const organization_read_controller: TController = {
  method: "get",
  route_path: "/",
  middlewares: [],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (!req.app_data.auth.is_system_owner) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }
    const pipeline_pagination = my_db.get_pagination_pipeline({
      page_no: req.query.page_no as unknown as number,
      rows_per_page: req.query.rows_per_page as unknown as number,
      data_list_field_name: "organization_list"
    });

    const pipeline_match_search: Array<PipelineStage> = [];
    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipeline_match_search[pipeline_match_search.length] = {
        $match: {
          $or: [
            {
              name: my_db.get_regex_field_for_aggregation(
                req.query.search_text.toString(),
                false
              )
            },
            {
              subdomain: my_db.get_regex_field_for_aggregation(
                req.query.search_text.toString()
              )
            }
          ]
        }
      };
    }

    const pipeline_project_final: Array<PipelineStage> = [];
    if (!req.query.is_for_autocomplete) {
      pipeline_project_final[pipeline_project_final.length] = {
        $project: {
          _id: 1,
          name: 1,
          subdomain: 1,
          address: 1,
          business_day: 1,
          timezone: 1,
          currency: 1
        }
      };
    } else {
      pipeline_project_final[pipeline_project_final.length] = {
        $project: { _id: 1, name: 1, subdomain: 1 }
      };
    }

    const query_organization_aggregation = [
      ...pipeline_match_search,
      ...pipeline_project_final,
      ...pipeline_pagination
    ];
    const query_organization_data = (
      await req.app_data.db_connection.models.organization
        .aggregate(query_organization_aggregation)
        .exec()
    )[0];
    if (my_type.is_an_empty_object(query_organization_data)) {
      return { _data: null };
    }

    return { _data: query_organization_data };
  }
};

export { organization_read_controller };
