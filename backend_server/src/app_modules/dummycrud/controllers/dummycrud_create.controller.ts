import { Request } from "express";
import { TController } from "@app_root/core/types";
import { mw_validator } from "@app_root/core/middlewares/validator.middleware";
import { mw_multipart_formdata } from "@app_root/core/middlewares/multipart_formdata.middleware";
import { my_db, myUTC } from "@app_root/core/helpers";
import { dummycrud_create_validator } from "@app_root/app_modules/dummycrud/validators/dummycrud_create.validator";

const dummycrud_create_controller: TController = {
  method: "post",
  routePath: "/",
  middlewares: [
    mw_multipart_formdata("image", "dummycrud"),
    mw_validator(dummycrud_create_validator, true)
  ],
  controller: async (req: Request) => {
    const validatedInputData = req.appData.validationData.validatedInputData!;
    const uploadedFileList = req.appData.validationData.uploadedFileList;

    if (!uploadedFileList || !uploadedFileList.length) {
      throw {
        _status: 400,
        _code: "required_image",
        _message: "Image is required."
      };
    }

    const queryDummycrudData =
      await req.appData.dbConnection!.collections.dummycruds.findOne(
        {
          dummycrud: my_db.getRegexFieldForAggregation(
            validatedInputData.dummycrud
          )
        },
        { projection: { _id: 1 } }
      );

    if (queryDummycrudData?._id?.toString().trim()) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${validatedInputData.dummycrud} is already exists.`
      };
    }

    await req.appData.dbConnection!.collections.dummycruds.insertOne({
      created_at: myUTC().toJSDate(),
      created_by: req.appData.auth.user!._id,
      dummycrud: validatedInputData.dummycrud,
      image: {
        filename: uploadedFileList[0].filename,
        originalname: uploadedFileList[0].originalname,
        mimetype: uploadedFileList[0].mimetype,
        size: uploadedFileList[0].size
      }
    });

    return { _message: "Dummycrud created successfully." };
  }
};

export { dummycrud_create_controller };
