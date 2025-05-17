import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { my_type, my_db } from "@app_root/core/helpers";

const role_read_controller: TController = {
  method: "get",
  route_path: "/",
  middlewares: [],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      )
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }
    const pipeline_pagination = my_db.get_pagination_pipeline({
      page_no: req.query.page_no as unknown as number,
      rows_per_page: req.query.rows_per_page as unknown as number,
      data_list_field_name: "role_list"
    });

    const pipeline_match_search: Array<PipelineStage> = [];

    if (req.app_data.auth.organization?.toString().trim()) {
      pipeline_match_search[pipeline_match_search.length] = {
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
    const pipeline_project_final: Array<PipelineStage> = [];
    if (!req.query.is_for_autocomplete) {
      pipeline_project_final[pipeline_project_final.length] = {
        $project: { _id: 1, name: 1, have_rights: 1 }
      };
    } else {
      pipeline_project_final[pipeline_project_final.length] = {
        $project: { _id: 1, name: 1 }
      };
    }

    const query_role_aggregation = [
      ...pipeline_match_search,
      ...pipeline_project_final,
      ...pipeline_pagination
    ];
    const query_role_data = (
      await req.app_data.db_connection.models.role
        .aggregate(query_role_aggregation)
        .exec()
    )[0];
    if (my_type.is_an_empty_object(query_role_data)) {
      return { _data: null };
    }

    return { _data: query_role_data };
  }
};

export { role_read_controller };
