import { NextFunction, Request, Response } from "express";
import { my_joi } from "@app_root/core/helpers";

const mw_validator = (
  validationMiddlewareFunction: Function,
  isThrowAnError: boolean = false
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validatedInputData = await (
        validationMiddlewareFunction(req) as my_joi.ObjectSchema
      )
        .messages(my_joi.validationMessagesList)
        .validateAsync(
          req.appData.validationData.inputData,
          my_joi.getDefaultValidateOptions()
        );

      req.appData.validationData = {
        validatedInputData,
        uploadedFileList: req.appData.validationData.uploadedFileList
      };
    } catch (error) {
      req.appData.validationData = {
        validationErrors: my_joi.getValidationErrorMessages(
          (error as my_joi.ValidationError)?.details
        )
      };

      if (isThrowAnError) {
        return next({
          _status: 400,
          _code: "bad_input",
          _message: req.appData.validationData.validationErrors
        });
      }
    }

    return next();
  };
};

export { mw_validator };
