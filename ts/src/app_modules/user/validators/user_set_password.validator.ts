import { Request } from "express";
import Joi from "joi";

export const user_set_password_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  return Joi.object({
    password: Joi.string()
      .trim()
      .empty("")
      .required()
      .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
      .messages({
        "string.pattern.base":
          "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _!@#$, with a length between 8 and 10 characters."
      })
      .label("Password"),
    confirm_password: Joi.string()
      .trim()
      .empty("")
      .required()
      .when("password", {
        is: Joi.exist(),
        then: Joi.required().equal(Joi.ref("password"))
      })
      .messages({ "any.only": "{#label} does not match" })
      .label("Confirm password"),
    set_password_token: Joi.string()
      .trim()
      .empty("")
      .required()
      .label("Set password token")
  });
};
