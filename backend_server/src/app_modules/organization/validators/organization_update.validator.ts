import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";
import { addressValidator } from "@app_root/app_modules/common/validators/address.validator";

export const organization_update_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.params, ...req.body };

  return my_joi.Joi.object({
    _id: my_joi.Joi.string()
      .required()
      .custom(my_joi.customIsMongodbObjectId)
      .label("Organization id"),
    name: my_joi.Joi.string()
      .required()
      .insensitive()
      .label("Organization name"),
    address: addressValidator.required(),
    owner: my_joi.Joi.object({
      name: my_joi.Joi.object({
        first: my_joi.Joi.string()
          .required()
          .min(2)
          .max(30)
          .label("First name"),
        last: my_joi.Joi.string().min(2).max(30).label("Last name")
      })
        .required()
        .messages({
          "any.required": "Contact person's {#label} is required.",
          "object.base": "Contact person's {#label} is invalid."
        })
        .label("Name"),
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
      address: addressValidator.required(),
      mobile_phone_number: my_joi.Joi.string()
        .required()
        .max(15)
        .label("Mobile phone number")
    })
      .required()
      .label("Contact Person")
  });
};
