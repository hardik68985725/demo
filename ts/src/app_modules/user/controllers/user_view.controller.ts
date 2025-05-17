import { Request } from "express";
import { PipelineStage } from "mongoose";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_view_validator } from "@app_root/app_modules/user/validators/user_view.validator";
import { my_db, my_type } from "@app_root/core/helpers";

const user_view_controller: TController = {
  method: "get",
  route_path: "/profile/:_id?",
  middlewares: [mw_validator(user_view_validator, true)],
  is_disabled: false,
  is_auth_required: true,
  controller: async (req: Request) => {
    const { validated_input_data } = req.app_data.validation_data;

    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      ) &&
      validated_input_data?._id
    ) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const pipeline_match: Array<PipelineStage> = [];
    pipeline_match[0] = { $match: { _id: req.app_data.auth.created_by } };

    if (validated_input_data?._id) {
      pipeline_match[0].$match._id = new my_db.mongodb_objectid(
        validated_input_data?._id as string
      );
    }

    if (
      !(
        req.app_data.auth.is_system_owner ||
        req.app_data.auth.is_organization_owner
      )
    ) {
      pipeline_match[0].$match._id = req.app_data.auth.created_by;
    }

    if (req.app_data.auth.is_organization_owner) {
      pipeline_match[0].$match.organization = req.app_data.auth.organization;
    }

    if (!pipeline_match[0].$match._id) {
      return { _data: null };
    }

    const pipeline_lookup_of_role: Array<PipelineStage> = [];
    if (
      !new my_db.mongodb_objectid(
        pipeline_match[0].$match._id as string
      ).equals(req.app_data.auth.created_by)
    ) {
      pipeline_lookup_of_role[pipeline_lookup_of_role.length] = {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
          pipeline: [{ $project: { _id: 1, name: 1, have_rights: 1 } }]
        }
      };

      pipeline_lookup_of_role[pipeline_lookup_of_role.length] = {
        $unwind: { path: "$role", preserveNullAndEmptyArrays: true }
      };
    }

    const pipeline_project_final: Array<PipelineStage> = [];
    pipeline_project_final[0] = {
      $project: {
        _id: 1,
        email: 1,
        mobile_phone_number: 1,
        name: 1,
        birth_date: 1,
        gender: 1,
        address: 1
      }
    };
    if (
      req.app_data.auth.is_system_owner ||
      req.app_data.auth.is_organization_owner
    ) {
      pipeline_project_final[0].$project.role = 1;
    }

    const query_user_aggregation = [
      ...pipeline_match,
      ...pipeline_lookup_of_role,
      ...pipeline_project_final
    ];

    const query_user_data = (
      await req.app_data.db_connection.models.user
        .aggregate(query_user_aggregation)
        .exec()
    )[0];
    if (my_type.is_an_empty_object(query_user_data)) {
      return { _data: null };
    }

    return { _data: query_user_data };
  }
};

export { user_view_controller };
