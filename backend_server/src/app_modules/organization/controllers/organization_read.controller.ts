import { Request } from "express";
import { Document } from "mongodb";
import { TController } from "@app_root/core/types";
import { my_type, my_db } from "@app_root/core/helpers";
import { CoreEnums } from "@app_root/core/enums";

const organization_read_controller: TController = {
  method: "get",
  routePath: "/",
  middlewares: [],
  controller: async (req: Request) => {
    if (req.appData.auth.user!.organization) {
      throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
    }

    const pipelinePagination = my_db.getPaginationPipeline({
      pageNo: req.query.page_no as unknown as number,
      rowsPerPage: req.query.rows_per_page as unknown as number,
      dataListFieldName: "organization_list"
    });
    const pipelineMatchSearch: Document[] = [];
    const pipelineLookupOfUser: Document[] = [];
    const pipelineProjectFinal: Document[] = [
      { $project: { _id: 1, name: 1 } }
    ];

    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipelineMatchSearch[0] = {
        $match: {
          $or: [
            {
              subdomain: my_db.getRegexFieldForAggregation(
                req.query.search_text.toString(),
                false
              )
            },
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

    if (req.query.fields?.toString().trim() === CoreEnums.EReadFields.All) {
      pipelineLookupOfUser[0] = {
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
      pipelineLookupOfUser[1] = { $unwind: "$owner" };

      pipelineProjectFinal[0] = {
        $project: { _id: 1, subdomain: 1, name: 1, address: 1, owner: 1 }
      };
    }

    const queryOrganizationAggregation = [
      ...pipelineMatchSearch,
      ...pipelineLookupOfUser,
      ...pipelineProjectFinal,
      ...pipelinePagination
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

export { organization_read_controller };
