import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";
import { UserEnums } from "@app_root/app_modules/user/enums";
import { addressValidator } from "@app_root/app_modules/common/validators/address.validator";

export const user_update_profile_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.body };

  return my_joi.Joi.object({
    password: my_joi.Joi.required().label("Password"),
    new_password: my_joi.Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!@#$])[A-Za-z\d_!@#$]{8,10}$/
      )
      .messages({
        "string.pattern.base":
          "{#label} must be 8-10 characters long, include uppercase and lowercase letters, a number, and a special character from _!@#$."
      })
      .label("New password"),
    confirm_new_password: my_joi.Joi.string()
      .when("new_password", {
        is: my_joi.Joi.exist(),
        then: my_joi.Joi.required().equal(my_joi.Joi.ref("new_password"))
      })
      .messages({ "any.only": "{#label} does not match" })
      .label("Confirm new password"),
    mobile_phone_number: my_joi.Joi.string()
      .required()
      .max(15)
      .label("Mobile phone number"),
    name: my_joi.Joi.object({
      first: my_joi.Joi.string().required().min(2).max(30).label("First name"),
      last: my_joi.Joi.string().min(2).max(30).label("Last name")
    })
      .required()
      .label("Name"),
    birth_date: my_joi.Joi.date().required().label("Birth date"),
    gender: my_joi.Joi.string()
      .required()
      .enum(Object.values(UserEnums.EGenders), Object.keys(UserEnums.EGenders))
      .label("Gender"),
    address: addressValidator.required()
  });
};
