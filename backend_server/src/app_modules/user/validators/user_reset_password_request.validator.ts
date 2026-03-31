import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";

export const user_reset_password_request_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.body };

  return my_joi.Joi.object({
    email: my_joi.Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .label("Email")
  });
};
