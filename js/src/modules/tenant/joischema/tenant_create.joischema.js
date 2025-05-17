const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: { joi_get_messages_list, joi_get_default_validate_options },
} = require("../../../helpers/helpers.index");
const {
  joischema_address,
} = require("../../common/joischema/address.joischema");
const {
  service_common: {
    service_subdomain: {
      config: { enum_preserved_subdomain },
    },
    service_timezone: {
      config: { enum_timezone },
    },
  },
} = require("../../common/service/common.service");

module.exports.joischema_tenant_create = async (_value) => {
  try {
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
        .label("End At"),
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
      saturday: daySchema.required(),
    })
      .required()
      .unknown(false) // Enforce strict key checking
      .messages({
        "object.unknown": "Invalid key in Business day: {#label}.",
        "string.pattern.base":
          "{#label} is invalid. It Must be like 01:23 or 12:34.",
      });

    const body_data = await Joi.object({
      subdomain: Joi.string()
        .trim()
        .empty("")
        .required()
        .insensitive()
        .invalid(...enum_preserved_subdomain)
        .pattern(new RegExp("^[a-z][a-z0-9]{2,14}$"))
        .messages({
          "string.pattern.base":
            "{#label} must contain lowercase letters or numbers and have a length between 3 and 15 characters.",
        })
        .label("Subdomain"),
      name: Joi.string()
        .trim()
        .empty("")
        .required()
        .insensitive()
        .label("Organization name"),
      address: joischema_address.required(),
      business_day: businessDaySchema.required(),
      timezone: Joi.string()
        .trim()
        .empty("")
        .valid(...enum_timezone)
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${enum_timezone
            .join()
            .slice(0, 30)}...`,
        })
        .label("Timezone"),
      mqtt_topic: Joi.string()
        .trim()
        .empty("")
        .required()
        .insensitive()
        .label("MQTT topic"),
      blukii_hub_id: Joi.string()
        .trim()
        .empty("")
        .default("")
        .insensitive()
        .label("blukii Hub Id"),
      currency: Joi.string().trim().empty("").required().label("Currency"),
      tenant_owner: Joi.object({
        name: Joi.object({
          first: Joi.string()
            .trim()
            .empty("")
            .required()
            .min(2)
            .max(30)
            .label("First name"),
          last: Joi.string().trim().empty("").min(2).max(30).label("Last name"),
        })
          .required()
          .messages({
            "any.required": "{#label} is required.",
            "object.base": "Contact person's {#label} is invalid.",
          })
          .label("Name"),
        email: Joi.string()
          .trim()
          .empty("")
          .required()
          .email({ tlds: { allow: false } })
          .label("Email"),
        address: joischema_address.required(),
        mobile_phone_number: Joi.string()
          .trim()
          .empty("")
          .required()
          .max(15)
          .label("Mobile phone number"),
      })
        .required()
        .label("Contact Person"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        {
          subdomain: _value.subdomain,
          name: _value.name,
          address: _value.address,
          business_day: _value.business_day,
          timezone: _value.timezone,
          mqtt_topic: _value.mqtt_topic,
          blukii_hub_id: _value.blukii_hub_id,
          currency: _value.currency,
          tenant_owner: _value.tenant_owner,
        },
        { ...joi_get_default_validate_options() }
      );
    return { body_data };
  } catch (_caught_error) {
    return {
      validation_errors: get_validation_error_messages(_caught_error?.details),
    };
  }
};
