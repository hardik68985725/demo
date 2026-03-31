import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_db } from "@app_root/core/helpers";
import { dummycrud_view_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_view.validator";

const dummycrud_view_controller: TController = {
  method: "get",
  routePath: "/:_id",
  middlewares: [mw_validator(dummycrud_view_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryDummycrud = {
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    };

    const queryDummycrudData =
      await req.appData.dbConnection!.collections.dummycruds.findOne(
        { _id: queryDummycrud._id! },
        { projection: { _id: 1, dummycrud: 1 } }
      );

    return { _data: queryDummycrudData };
  }
};

export { dummycrud_view_controller };
