import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";
import { OrganizationEnums } from "@app_root/app_modules/organization/enums";
import { address_validator } from "@app_root/app_modules/common/validators/address.validator";

export const organization_update_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.params, ...req.body };
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
  const ETimezonesKeys = (
    Object.keys(OrganizationEnums.ETimezones) as Array<string>
  )
    .join()
    .slice(0, 30);
  const ETimezonesValues = Object.values(
    OrganizationEnums.ETimezones
  ) as Array<string>;

  return Joi.object({
    _id: Joi.string()
      .trim()
      .empty("")
      .required()
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Organization id"),
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
      password: Joi.string()
        .trim()
        .empty("")
        .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
        .messages({
          "string.pattern.base":
            "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _!@#$, with a length between 8 and 10 characters."
        })
        .label("Password"),
      confirm_password: Joi.string()
        .trim()
        .empty("")
        .when("password", {
          is: Joi.exist(),
          then: Joi.required().equal(Joi.ref("password"))
        })
        .messages({ "any.only": "{#label} does not match" })
        .label("Confirm password"),
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
