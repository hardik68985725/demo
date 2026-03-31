import { Request } from "express";
import { TController, TDocumentOrQuery } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { my_db, myUTC } from "@app_root/core/helpers";
import { dummycrud_update_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_update.validator";

const dummycrud_update_controller: TController = {
  method: "patch",
  routePath: "/:_id",
  middlewares: [mw_validator(dummycrud_update_validator, true)],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;

    const queryDummycrudById: TDocumentOrQuery = {
      _id: new my_db.mongodbObjectId(validatedInputData._id as string)
    };

    const queryDummycrudDataById =
      await req.appData.dbConnection!.collections.dummycruds.findOne(
        { _id: queryDummycrudById._id },
        { projection: { _id: 1 } }
      );
    if (!queryDummycrudDataById?._id?.toString().trim()) {
      throw {
        _status: 403,
        _code: "invalid_dummycrud",
        _message: "Dummycrud is invalid."
      };
    }

    const queryDummycrudDataByDummycrud =
      await req.appData.dbConnection!.collections.dummycruds.findOne(
        {
          dummycrud: my_db.getRegexFieldForAggregation(
            validatedInputData.dummycrud
          )
        },
        { projection: { _id: 1 } }
      );
    if (
      queryDummycrudDataByDummycrud &&
      !queryDummycrudDataByDummycrud._id.equals(queryDummycrudDataById._id)
    ) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validatedInputData.dummycrud} is already exists.`
      };
    }

    await req.appData.dbConnection!.collections.dummycruds.updateOne(
      { _id: queryDummycrudById._id! },
      {
        $set: {
          created_at: myUTC().toJSDate(),
          created_by: req.appData.auth.user!._id,
          dummycrud: validatedInputData.dummycrud
        }
      }
    );

    return { _message: "Dummycrud updated successfully." };
  }
};

export { dummycrud_update_controller };
