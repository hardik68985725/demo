import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";
import { DummycrudEnums } from "@app_root/app_modules/dummycrud/enums";

export const dummycrud_update_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.params, ...req.body };

  return my_joi.Joi.object({
    _id: my_joi.Joi.string()
      .insensitive()
      .custom(my_joi.customIsMongodbObjectId)
      .label("Dummycrud id"),
    dummycrud: my_joi.Joi.string()
      .insensitive()
      .enum(
        Object.values(DummycrudEnums.EDummycruds),
        Object.keys(DummycrudEnums.EDummycruds)
      )
      .default(DummycrudEnums.EDummycruds["Dummycrud 1"])
      .label("Dummycrud")
  });
};
