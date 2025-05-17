const Joi = require("joi");
const {
  joischema_address,
} = require("../../common/joischema/address.joischema");
const {
  get_validation_error_messages,
  my_joi: {
    joi_get_messages_list,
    joi_get_default_validate_options,
    joi_custom_is_mongodb_objectid,
  },
} = require("../../../helpers/helpers.index");
const {
  service_common: {
    service_timezone: {
      config: { enum_timezone },
    },
  },
} = require("../../common/service/common.service");

module.exports.joischema_tenant_update = async (_value) => {
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
      .messages({
        "string.pattern.base":
          "{#label} is invalid. It Must be like 01:23 or 12:34.",
      });

    const body_data = await Joi.object({
      _id: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Organization id"),
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
        password: Joi.string()
          .trim()
          .empty("")
          .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
          .messages({
            "string.pattern.base":
              "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _!@#$, with a length between 8 and 10 characters.",
          })
          .label("Password"),
        confirm_password: Joi.string()
          .trim()
          .empty("")
          .when("password", {
            is: Joi.exist(),
            then: Joi.required().equal(Joi.ref("password")),
          })
          .messages({ "any.only": "{#label} does not match" })
          .label("Confirm password"),
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
          _id: _value._id,
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
