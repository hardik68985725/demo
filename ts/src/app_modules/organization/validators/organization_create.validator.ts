import { Request } from "express";
import Joi from "joi";
import { OrganizationEnums } from "@app_root/app_modules/organization/enums";
import { address_validator } from "@app_root/app_modules/common/validators/address.validator";

export const organization_create_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };
  const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

  const daySchema = Joi.object({
    start_at: Joi.string()
      .trim()
      .empty("")
      .pattern(timePattern)
      .default("00:00")
      .label("Start At"),
    end_at: Joi.string()
      .trim()
      .empty("")
      .pattern(timePattern)
      .default("23:59")
      .label("End At")
  })
    .required()
    .unknown(false);

  const businessDaySchema = Joi.object({
    sunday: daySchema.required(),
    monday: daySchema.required(),
    tuesday: daySchema.required(),
    wednesday: daySchema.required(),
    thursday: daySchema.required(),
    friday: daySchema.required(),
    saturday: daySchema.required()
  })
    .required()
    .unknown(false) // Enforce strict key checking
    .messages({
      "object.unknown": "Invalid key in Business day: {#label}.",
      "string.pattern.base":
        "{#label} is invalid. It Must be like 01:23 or 12:34."
    });
  const EPreservedSubdomainsValues = Object.values(
    OrganizationEnums.EPreservedSubdomains
  ) as Array<string>;

  const ETimezonesKeys = (
    Object.keys(OrganizationEnums.ETimezones) as Array<string>
  )
    .join()
    .slice(0, 30);
  const ETimezonesValues = Object.values(
    OrganizationEnums.ETimezones
  ) as Array<string>;

  return Joi.object({
    subdomain: Joi.string()
      .trim()
      .empty("")
      .required()
      .insensitive()
      .invalid(...EPreservedSubdomainsValues)
      .pattern(new RegExp("^[a-z][a-z0-9]{2,14}$"))
      .messages({
        "string.pattern.base":
          "{#label} must contain a lowercase letters or numbers and have a length between 3 and 15 characters."
      })
      .label("Subdomain"),
    name: Joi.string()
      .trim()
      .empty("")
      .required()
      .insensitive()
      .label("Organization name"),
    address: address_validator.required(),
    business_day: businessDaySchema.required(),
    timezone: Joi.string()
      .trim()
      .empty("")
      .valid(...ETimezonesValues)
      .default(OrganizationEnums.ETimezones.UTC)
      .messages({
        "any.only": `{#label} is invalid. Value must be among ${ETimezonesKeys}...`
      })
      .label("Timezone"),
    currency: Joi.string().trim().empty("").required().label("Currency"),
    owner: Joi.object({
      name: Joi.object({
        first: Joi.string()
          .trim()
          .empty("")
          .required()
          .min(2)
          .max(30)
          .label("First name"),
        last: Joi.string().trim().empty("").min(2).max(30).label("Last name")
      })
        .required()
        .messages({
          "any.required": "{#label} is required.",
          "object.base": "Contact person's {#label} is invalid."
        })
        .label("Name"),
      email: Joi.string()
        .trim()
        .empty("")
        .required()
        .email({ tlds: { allow: false } })
        .label("Email"),
      address: address_validator.required(),
      mobile_phone_number: Joi.string()
        .trim()
        .empty("")
        .required()
        .max(15)
        .label("Mobile phone number")
    })
      .required()
      .label("Contact Person")
  });
};
