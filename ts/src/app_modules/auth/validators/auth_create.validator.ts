import { Request } from "express";
import Joi from "joi";

export const auth_create_validator = (req: Request) => {
  req.app_data.validation_data.input_data = {
    ...req.body,
    maca: req.app_data.maca,
    useragent: JSON.stringify(req.app_data.useragent)
  };

  return Joi.object({
    maca: Joi.string().trim().empty("").label("MAC Address"),
    useragent: Joi.string().trim().empty("").label("User Agent"),
    email: Joi.string()
      .trim()
      .empty("")
      .required()
      .email({ tlds: { allow: false } })
      .label("Email"),
    password: Joi.string()
      .trim()
      .empty("")
      .required()
      .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
      .messages({
        "string.pattern.base":
          "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _ ! @ # $ and have a length between 8 and 15 characters."
      })
      .label("Password")
  });
};
