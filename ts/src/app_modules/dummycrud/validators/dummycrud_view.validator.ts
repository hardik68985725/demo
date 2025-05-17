import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";

export const dummycrud_view_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.params };

  return Joi.object({
    _id: Joi.string()
      .trim()
      .empty("")
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Dummycrud id")
  });
};
