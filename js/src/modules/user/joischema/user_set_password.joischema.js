const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: { joi_get_messages_list, joi_get_default_validate_options },
} = require("../../../helpers/helpers.index");

module.exports.joischema_user_set_password = async (_value) => {
  try {
    const body_data = await Joi.object({
      password: Joi.string()
        .trim()
        .empty("")
        .required()
        .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
        .messages({
          "string.pattern.base":
            "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _!@#$, with a length between 8 and 10 characters.",
        })
        .label("Password"),
      confirm_password: Joi.string()
        .trim()
        .empty("")
        .required()
        .when("password", {
          is: Joi.exist(),
          then: Joi.required().equal(Joi.ref("password")),
        })
        .messages({ "any.only": "{#label} does not match" })
        .label("Confirm password"),
      set_password_token: Joi.string()
        .trim()
        .empty("")
        .required()
        .label("Set password token"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        {
          password: _value.password,
          confirm_password: _value.confirm_password,
          set_password_token: _value.set_password_token,
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
