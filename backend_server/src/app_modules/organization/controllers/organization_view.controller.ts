import { Request } from "express";
import { Document } from "mongodb";
import { TController } from "@app_root/core/types";
import { my_type, my_db } from "@app_root/core/helpers";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { organization_view_validator } from "@app_root/app_modules/organization/validators/organization_view.validator";

const organization_view_controller: TController = {
  method: "get",
  routePath: "/view{/:_id}",
  middlewares: [mw_validator(organization_view_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    if (req.appData.auth.user!.organization && validatedInputData._id) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    if (!req.appData.auth.user!.organization && !validatedInputData._id) {
      throw {
        _status: 400,
        _code: "bad_input",
        _message: "Organization is required."
      };
    }

    const pipelineMatch: Document[] = [
      {
        $match: {
          _id: new my_db.mongodbObjectId(validatedInputData._id as string)
        }
      }
    ];

    if (req.appData.auth.user?.organization?._id?.toString().trim()) {
      pipelineMatch[0].$match._id = new my_db.mongodbObjectId(
        req.appData.auth.user?.organization?._id?.toString().trim()
      );
    }

    const pipelineLookupOfUser: Document[] = [
      {
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
      },
      { $unwind: "$owner" }
    ];

    const pipelineProjectFinal: Document[] = [
      { $project: { _id: 1, subdomain: 1, name: 1, address: 1, owner: 1 } }
    ];

    const queryOrganizationAggregation = [
      ...pipelineMatch,
      ...pipelineLookupOfUser,
      ...pipelineProjectFinal
    ];

    const queryOrganizationData = (
      await req.appData
        .dbConnection!.collections.organizations.aggregate(
          queryOrganizationAggregation
        )
        .toArray()
    )[0];
    if (my_type.isAnEmptyObject(queryOrganizationData)) {
      return { _data: null };
    }

    return { _data: queryOrganizationData };
  }
};

export { organization_view_controller };
