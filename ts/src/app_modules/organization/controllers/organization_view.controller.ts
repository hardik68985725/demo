import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { organization_view_validator } from "@app_root/app_modules/organization/validators/organization_view.validator";
import { my_db, my_type } from "@app_root/core/helpers";

const organization_view_controller: TController = {
  method: "get",
  route_path: "/view/:_id?",
  middlewares: [
    mw_role("organization", "read"),
    mw_validator(organization_view_validator, true)
  ],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    if (req.app_data.auth.organization && validated_input_data?._id) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    if (!req.app_data.auth.organization && !validated_input_data?._id) {
      throw {
        _status: 400,
        _code: "bad_input",
        _message: "Organization is required"
      };
    }

    const pipeline_match: Array<PipelineStage> = [];
    pipeline_match[0] = { $match: { _id: undefined } };
    if (validated_input_data?._id) {
      pipeline_match[0].$match._id = new my_db.mongodb_objectid(
        validated_input_data?._id as string
      );
    }

    if (req.app_data.auth.organization?.toString().trim()) {
      pipeline_match[0].$match._id = new my_db.mongodb_objectid(
        req.app_data.auth.organization as string
      );
    }

    const pipeline_lookup_of_user: Array<PipelineStage> = [];
    if (
      !new my_db.mongodb_objectid(
        pipeline_match[0].$match._id as string
      ).equals(req.app_data.auth.created_by)
    ) {
      pipeline_lookup_of_user[pipeline_lookup_of_user.length] = {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                _id: 0,
                email: 1,
                name: 1,
                address: 1,
                mobile_phone_number: 1
              }
            }
          ]
        }
      };

      pipeline_lookup_of_user[pipeline_lookup_of_user.length] = {
        $unwind: "$owner"
      };
    }

    const pipeline_project_final: Array<PipelineStage> = [];
    pipeline_project_final[0] = {
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
    if (req.app_data.auth.is_system_owner) {
      pipeline_project_final[0].$project.owner = 1;
    }

    const query_organization_aggregation = [
      ...pipeline_match,
      ...pipeline_lookup_of_user,
      ...pipeline_project_final
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

export { organization_view_controller };
