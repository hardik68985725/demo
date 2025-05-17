import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";

export const user_update_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body, ...req.params };

  return Joi.object({
    _id: Joi.string()
      .trim()
      .empty("")
      .required()
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("User id"),
    role: Joi.string()
      .trim()
      .empty("")
      .required()
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Role")
  });
};
