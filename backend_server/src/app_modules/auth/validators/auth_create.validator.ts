import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";

export const auth_create_validator = (req: Request) => {
  req.appData.validationData.inputData = {
    ...req.body,
    useragent: JSON.stringify(req.appData.useragent)
  };

  return my_joi.Joi.object({
    useragent: my_joi.Joi.string().label("User Agent"),
    email: my_joi.Joi.string()
      .required()
      .insensitive()
      .email({ tlds: { allow: false } })
      .label("Email"),
    password: my_joi.Joi.string().required().label("Password")
  });
};
