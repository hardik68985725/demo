const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: {
    joi_get_messages_list,
    joi_get_default_validate_options,
    joi_custom_is_mongodb_objectid,
  },
} = require("../../../helpers/helpers.index");

module.exports.joischema_product_update = async (_value) => {
  try {
    const body_data = await Joi.object({
      _id: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Product id"),
      name: Joi.string()
        .trim()
        .empty("")
        .required()
        .insensitive()
        .label("Product name"),
      color: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .label("Color code"),

      duration: Joi.alternatives()
        .try(
          Joi.number(),
          Joi.string()
            .trim()
            .empty("")
            .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$"))
        )
        .required()
        .messages({
          "alternatives.match":
            "{#label} is invalid. It must be a number or a string representing a number.",
        })
        .label("Duration"),
      tolerance: Joi.alternatives()
        .try(
          Joi.number(),
          Joi.string()
            .trim()
            .empty("")
            .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$"))
        )
        .required()
        .messages({
          "alternatives.match":
            "{#label} is invalid. It must be a number or a string representing a number.",
        })
        .label("Tolerance"),

      quarantine: Joi.alternatives()
        .try(
          Joi.number(),
          Joi.string()
            .trim()
            .empty("")
            .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$"))
        )
        .required()
        .messages({
          "alternatives.match":
            "{#label} is invalid. It must be a number or a string representing a number.",
        })
        .label("Quarantine Limit"),
      group: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Group"),
      price: Joi.string()
        .trim()
        .empty("")
        .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$")) // NUMBER PATTERN WITH DECIMAL POINT. EX.: 55.55 IS VALID, 5S.55 IS INVALID.
        .messages({
          "string.pattern.base": "{#label} is invalid. It must be a number.",
        })
        .label("Price"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        {
          _id: _value._id,
          name: _value.name,
          duration: _value.duration,
          tolerance: _value.tolerance,
          quarantine: _value.quarantine,
          group: _value.group,
          price: _value.price,
          color: _value.color,
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
