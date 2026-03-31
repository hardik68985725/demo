import { Request } from "express";
import { Document } from "mongodb";
import { TController } from "@app_root/core/types";
import { mw_role } from "@app_root/core/middlewares/role.middleware";
import { my_type, my_db } from "@app_root/core/helpers";
import { CoreEnums } from "@app_root/core/enums";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const role_read_controller: TController = {
  method: "get",
  routePath: "/",
  middlewares: [
    mw_role({
      moduleName: RoleEnums.EPermissionModuleNames.Role,
      permission: RoleEnums.EPermissionNames.Read
    })
  ],
  controller: async (req: Request) => {
    const pipelinePagination = my_db.getPaginationPipeline({
      pageNo: req.query.page_no as unknown as number,
      rowsPerPage: req.query.rows_per_page as unknown as number,
      dataListFieldName: "role_list"
    });

    const pipelineMatchSearch: Document[] = [];
    if (req.appData.auth.user!.ownDataQuery) {
      pipelineMatchSearch[0] = { $match: req.appData.auth.user!.ownDataQuery };
    }

    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipelineMatchSearch[pipelineMatchSearch.length] = {
        $match: {
          $or: [
            {
              name: my_db.getRegexFieldForAggregation(
                req.query.search_text.toString(),
                false
              )
            }
          ]
        }
      };
    }

    const pipelineProjectFinal: Document[] = [
      { $project: { _id: 1, name: 1 } }
    ];

    if (req.query.fields?.toString().trim() === CoreEnums.EReadFields.All) {
      pipelineProjectFinal[0] = {
        $project: { _id: 1, name: 1, have_rights: 1 }
      };
    }

    const queryRoleAggregation = [
      ...pipelineMatchSearch,
      ...pipelineProjectFinal,
      ...pipelinePagination
    ];

    const queryRoleData = (
      await req.appData
        .dbConnection!.collections.roles.aggregate(queryRoleAggregation)
        .toArray()
    )[0];
    if (my_type.isAnEmptyObject(queryRoleData)) {
      return { _data: null };
    }

    return { _data: queryRoleData };
  }
};

export { role_read_controller };
