import { Request } from "express";
import { Document } from "mongodb";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { user_view_validator } from "@app_root/app_modules/user/validators/user_view.validator";
import { my_db, my_type } from "@app_root/core/helpers";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const user_view_controller: TController = {
  method: "get",
  routePath: "/:_id",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Read
    }),
    mw_validator(user_view_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const pipelineMatch: Document[] = [
      { $match: { _id: req.appData.auth.user!._id } }
    ];

    if (validatedInputData._id) {
      pipelineMatch[0].$match._id = new my_db.mongodbObjectId(
        validatedInputData._id as string
      );
    }

    const pipelineLookupOfRole: Document[] = [];
    if (
      !new my_db.mongodbObjectId(pipelineMatch[0].$match._id as string).equals(
        req.appData.auth.user!._id
      )
    ) {
      pipelineLookupOfRole[0] = {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
          pipeline: [{ $project: { _id: 1, name: 1, have_rights: 1 } }]
        }
      };
      pipelineLookupOfRole[1] = {
        $unwind: { path: "$role", preserveNullAndEmptyArrays: true }
      };
    }

    const pipelineProjectFinal: Document[] = [
      {
        $project: {
          _id: 1,
          email: 1,
          mobile_phone_number: 1,
          name: 1,
          birth_date: 1,
          gender: 1,
          address: 1
        }
      }
    ];

    const queryUserAggregation = [
      ...pipelineMatch,
      ...pipelineLookupOfRole,
      ...pipelineProjectFinal
    ];

    const queryUserData = (
      await req.appData
        .dbConnection!.collections.users.aggregate(queryUserAggregation)
        .toArray()
    )[0];
    if (my_type.isAnEmptyObject(queryUserData)) {
      return { _data: null };
    }

    return { _data: queryUserData };
  }
};

export { user_view_controller };
