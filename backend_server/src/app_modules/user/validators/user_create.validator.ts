import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";

export const user_create_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.body };

  return my_joi.Joi.object({
    email: my_joi.Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .label("Email"),
    role: my_joi.Joi.string()
      .required()
      .custom(my_joi.customIsMongodbObjectId)
      .label("Role"),
    name: my_joi.Joi.object({
      first: my_joi.Joi.string().required().min(2).max(30).label("First name"),
      last: my_joi.Joi.string().min(2).max(30).label("Last name")
    })
      .required()
      .label("Name")
  });
};
