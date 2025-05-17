import { Request } from "express";
import Joi from "joi";

export const user_reset_password_request_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  return Joi.object({
    email: Joi.string()
      .label("Email")
      .trim()
      .empty("")
      .required()
      .email({ tlds: { allow: false } })
  });
};
