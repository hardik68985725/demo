const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: { joi_get_messages_list, joi_get_default_validate_options },
} = require("../../../helpers/helpers.index");

module.exports.joischema_auth_create = async (_value) => {
  try {
    const body_data = await Joi.object({
      email: Joi.string()
        .trim()
        .empty("")
        .required()
        .email({ tlds: { allow: false } })
        .label("Email"),
      password: Joi.string()
        .trim()
        .empty("")
        .required()
        .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
        .messages({
          "string.pattern.base":
            "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _ ! @ # $ and have a length between 8 and 15 characters.",
        })
        .label("Password"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        { email: _value.email, password: _value.password },
        { ...joi_get_default_validate_options() }
      );
    return { body_data };
  } catch (_caught_error) {
    return {
      validation_errors: get_validation_error_messages(_caught_error?.details),
    };
  }
};
