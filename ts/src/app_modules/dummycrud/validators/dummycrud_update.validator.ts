import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";
import { DummycrudEnums } from "@app_root/app_modules/dummycrud/enums";

export const dummycrud_update_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.params, ...req.body };

  const EDummycrudsKeys = (
    Object.keys(DummycrudEnums.EDummycruds) as Array<string>
  ).join();
  const EDummycrudsValues = Object.values(
    DummycrudEnums.EDummycruds
  ) as Array<string>;

  return Joi.object({
    _id: Joi.string()
      .trim()
      .empty("")
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Dummycrud id"),
    dummycrud: Joi.string()
      .trim()
      .empty("")
      .valid(...EDummycrudsValues)
      .insensitive()
      .default(DummycrudEnums.EDummycruds.Dummycrud)
      .messages({
        "any.only": `{#label} is invalid. Value must be among ${EDummycrudsKeys}.`
      })
      .label("Dummycrud")
  });
};
