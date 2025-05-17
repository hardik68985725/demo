import { Request } from "express";
import Joi from "joi";
import { DummycrudEnums } from "@app_root/app_modules/dummycrud/enums";

export const dummycrud_create_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  const EDummycrudsKeys = (
    Object.keys(DummycrudEnums.EDummycruds) as Array<string>
  ).join();
  const EDummycrudsValues = Object.values(
    DummycrudEnums.EDummycruds
  ) as Array<string>;

  return Joi.object({
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
