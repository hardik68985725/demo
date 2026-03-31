import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";

export const user_set_password_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.body };

  return my_joi.Joi.object({
    password: my_joi.Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!@#$])[A-Za-z\d_!@#$]{8,10}$/
      )
      .messages({
        "string.pattern.base":
          "{#label} must be 8-10 characters long, include uppercase and lowercase letters, a number, and a special character from _!@#$."
      })
      .label("Password"),
    confirm_password: my_joi.Joi.string()
      .required()
      .when("password", {
        is: my_joi.Joi.exist(),
        then: my_joi.Joi.required().equal(my_joi.Joi.ref("password"))
      })
      .messages({ "any.only": "{#label} does not match" })
      .label("Confirm password"),
    set_password_token: my_joi.Joi.string()
      .required()
      .label("Set password token")
  });
};
