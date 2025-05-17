import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";

export const user_create_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  return Joi.object({
    email: Joi.string()
      .trim()
      .empty("")
      .required()
      .email({ tlds: { allow: false } })
      .label("Email"),
    role: Joi.string()
      .trim()
      .empty("")
      .required()
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Role"),
    name: Joi.object({
      first: Joi.string().trim().empty("").min(3).max(30).label("First name"),
      last: Joi.string().trim().empty("").min(3).max(30).label("Last name")
    }).label("Name")
  });
};
