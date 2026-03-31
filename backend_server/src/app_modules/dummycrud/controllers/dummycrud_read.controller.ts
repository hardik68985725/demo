import { Request } from "express";
import { Document } from "mongodb";
import { TController } from "@app_root/core/types";
import { my_db, my_type } from "@app_root/core/helpers";

const dummycrud_read_controller: TController = {
  method: "get",
  routePath: "/",
  middlewares: [],
  controller: async (req: Request) => {
    const pipelinePagination = my_db.getPaginationPipeline({
      pageNo: req.query.page_no as unknown as number,
      rowsPerPage: req.query.rows_per_page as unknown as number,
      dataListFieldName: "dummycrud_list"
    });

    const pipelineMatchSearch: Document[] = [];
    if (req.query.search_text && req.query.search_text.toString().trim()) {
      pipelineMatchSearch[0] = {
        $match: {
          $or: [
            {
              dummycrud: my_db.getRegexFieldForAggregation(
                req.query.search_text.toString()
              )
            }
          ]
        }
      };
    }

    const pipelineProjectFinal: Document[] = [];
    pipelineProjectFinal[0] = {
      $project: { _id: 1, dummycrud: 1 }
    };

    const queryDummycrudAggregation = [
      ...pipelineMatchSearch,
      ...pipelineProjectFinal,
      ...pipelinePagination
    ];

    const queryDummycrudData = (
      await req.appData
        .dbConnection!.collections.dummycruds.aggregate(
          queryDummycrudAggregation
        )
        .toArray()
    )[0];
    if (my_type.isAnEmptyObject(queryDummycrudData)) {
      return { _data: null };
    }

    return { _data: queryDummycrudData };
  }
};

export { dummycrud_read_controller };
