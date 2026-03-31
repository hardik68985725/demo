import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";
import { addressValidator } from "@app_root/app_modules/common/validators/address.validator";
import { OrganizationEnums } from "@app_root/app_modules/organization/enums";

export const organization_create_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.body };

  return my_joi.Joi.object({
    subdomain: my_joi.Joi.string()
      .required()
      .insensitive()
      .enum(
        Object.values(OrganizationEnums.EPreservedSubdomains),
        Object.keys(OrganizationEnums.EPreservedSubdomains),
        true
      )
      .pattern(/^[a-z][a-z0-9]{2,14}$/)
      .messages({
        "string.pattern.base":
          "{#label} must be 3-15 characters long, start with a lowercase letter, and contain only lowercase letters and numbers."
      })
      .label("Subdomain"),
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
      email: my_joi.Joi.string()
        .required()
        .email({ tlds: { allow: false } })
        .label("Email"),
      mobile_phone_number: my_joi.Joi.string()
        .required()
        .max(15)
        .label("Mobile phone number"),
      address: addressValidator.required()
    })
      .required()
      .label("Contact Person")
  });
};
