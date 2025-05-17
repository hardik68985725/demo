const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: { joi_get_messages_list, joi_get_default_validate_options },
} = require("../../../helpers/helpers.index");

module.exports.joischema_user_reset_password_request = async (_value) => {
  try {
    const body_data = await Joi.object({
      email: Joi.string()
        .label("Email")
        .trim()
        .empty("")
        .required()
        .email({ tlds: { allow: false } }),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        { email: _value.email },
        { ...joi_get_default_validate_options() }
      );
    return { body_data };
  } catch (_caught_error) {
    return {
      validation_errors: get_validation_error_messages(_caught_error?.details),
    };
  }
};
