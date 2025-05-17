import { Request } from "express";
import Joi from "joi";
import { UserEnums } from "@app_root/app_modules/user/enums";
import { address_validator } from "@app_root/app_modules/common/validators/address.validator";

export const user_update_profile_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  const EGendersKeys = (
    Object.keys(UserEnums.EGenders) as Array<string>
  ).join();
  const EGendersValues = Object.values(UserEnums.EGenders) as Array<string>;

  return Joi.object({
    password: Joi.string().trim().empty("").required().label("Password"),
    new_password: Joi.string()
      .trim()
      .empty("")
      .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
      .messages({
        "string.pattern.base":
          "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _!@#$, with a length between 8 and 10 characters."
      })
      .label("New password"),
    confirm_new_password: Joi.string()
      .trim()
      .empty("")
      .when("new_password", {
        is: Joi.exist(),
        then: Joi.required().equal(Joi.ref("new_password"))
      })
      .messages({ "any.only": "{#label} does not match" })
      .label("Confirm new password"),
    mobile_phone_number: Joi.string()
      .trim()
      .empty("")
      .required()
      .max(15)
      .label("Mobile phone number"),
    name: Joi.object({
      first: Joi.string()
        .trim()
        .empty("")
        .required()
        .min(3)
        .max(30)
        .label("First name"),
      last: Joi.string().trim().empty("").min(3).max(30).label("Last name")
    }).label("Name"),
    birth_date: Joi.date().required().label("Birth date"),
    gender: Joi.string()
      .trim()
      .empty("")
      .required()
      .valid(...EGendersValues)
      .messages({
        "any.only": `{#label} is invalid. Value must be among ${EGendersKeys}.`
      })
      .label("Gender"),
    address: address_validator.required()
  });
};
