import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_db } from "@app_root/core/helpers";
import { dummycrud_view_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_view.validator";

const dummycrud_delete_controller: TController = {
  method: "delete",
  routePath: "/:_id",
  middlewares: [mw_validator(dummycrud_view_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    await req.appData.dbConnection!.collections.dummycruds.deleteOne({
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    });

    return { _message: "Dummycrud deleted successfully." };
  }
};

export { dummycrud_delete_controller };
