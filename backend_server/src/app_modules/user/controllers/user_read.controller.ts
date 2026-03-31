import { Request } from "express";
import { Document } from "mongodb";
import { TController } from "@app_root/core/types";
import { my_type, my_db } from "@app_root/core/helpers";
import { CoreEnums } from "@app_root/core/enums";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const user_read_controller: TController = {
  method: "get",
  routePath: "/",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.User,
      permission: RoleEnums.EPermissionNames.Read
    })
  ],
  controller: async (req: Request) => {
    const pipelinePagination = my_db.getPaginationPipeline({
      pageNo: req.query.page_no as unknown as number,
      rowsPerPage: req.query.rows_per_page as unknown as number,
      dataListFieldName: "user_list"
    });

    const pipelineMatch: Document[] = [
      { $match: { _id: { $ne: req.appData.auth.user!._id } } }
    ];

    const pipelineMatchSearch: Document[] = [];

    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipelineMatchSearch[0] = {
        $match: {
          $or: [
            {
              email: my_db.getRegexFieldForAggregation(
                req.query.search_text.toString().trim(),
                false
              )
            },
            {
              mobile_phone_number: my_db.getRegexFieldForAggregation(
                req.query.search_text.toString().trim(),
                false
              )
            },
            {
              "name.first": my_db.getRegexFieldForAggregation(
                req.query.search_text.toString().trim(),
                false
              )
            },
            {
              "name.last": my_db.getRegexFieldForAggregation(
                req.query.search_text.toString().trim(),
                false
              )
            }
          ]
        }
      };
    }

    const pipelineLookupOfRole: Document[] = [];

    const readFields = req.query.fields?.toString().trim();
    if (readFields === CoreEnums.EReadFields.All) {
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
      { $project: { _id: 1, email: 1, name: 1 } }
    ];

    if (readFields === CoreEnums.EReadFields.All) {
      pipelineProjectFinal[0] = {
        $project: { _id: 1, email: 1, mobile_phone_number: 1, name: 1, role: 1 }
      };
    }

    const queryUserAggregation = [
      ...pipelineMatch,
      ...pipelineMatchSearch,
      ...pipelineLookupOfRole,
      ...pipelineProjectFinal,
      ...pipelinePagination
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

export { user_read_controller };
