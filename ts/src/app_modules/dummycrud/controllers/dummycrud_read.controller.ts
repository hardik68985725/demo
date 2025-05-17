import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { my_db, my_type } from "@app_root/core/helpers";

const dummycrud_read_controller: TController = {
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
      data_list_field_name: "dummycrud_list"
    });

    const pipeline_match_search: Array<PipelineStage> = [];
    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipeline_match_search[pipeline_match_search.length] = {
        $match: {
          $or: [
            {
              dummycrud: my_db.get_regex_field_for_aggregation(
                req.query.search_text.toString()
              )
            }
          ]
        }
      };
    }

    const pipeline_project_final: Array<PipelineStage> = [];
    pipeline_project_final[pipeline_project_final.length] = {
      $project: { _id: 1, dummycrud: 1 }
    };

    const query_dummycrud_aggregation = [
      ...pipeline_match_search,
      ...pipeline_project_final,
      ...pipeline_pagination
    ];
    const query_dummycrud_data = (
      await req.app_data.db_connection.models.dummycrud
        .aggregate(query_dummycrud_aggregation)
        .exec()
    )[0];
    if (my_type.is_an_empty_object(query_dummycrud_data)) {
      return { _data: null };
    }

    return { _data: query_dummycrud_data };
  }
};

export { dummycrud_read_controller };
