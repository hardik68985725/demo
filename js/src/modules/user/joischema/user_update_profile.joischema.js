const Joi = require("joi");
const {
  joischema_address,
} = require("../../common/joischema/address.joischema");
const {
  get_validation_error_messages,
  my_joi: { joi_get_messages_list, joi_get_default_validate_options },
} = require("../../../helpers/helpers.index");
const {
  service_user: {
    config: { enum_gender },
  },
} = require("../service/user.service");

module.exports.joischema_user_update_profile = async (_value) => {
  try {
    const body_data = await Joi.object({
      password: Joi.string().trim().empty("").required().label("Password"),
      new_password: Joi.string()
        .trim()
        .empty("")
        .pattern(new RegExp("^[A-Za-z0-9_!@#$]{8,15}$"))
        .messages({
          "string.pattern.base":
            "{#label} must contain a combination of uppercase and lowercase letters, numbers, and special symbols from _!@#$, with a length between 8 and 10 characters.",
        })
        .label("New password"),
      confirm_new_password: Joi.string()
        .trim()
        .empty("")
        .when("new_password", {
          is: Joi.exist(),
          then: Joi.required().equal(Joi.ref("new_password")),
        })
        .messages({ "any.only": "{#label} does not match" })
        .label("Confirm new password"),
      mobile_phone_number: Joi.string()
        .trim()
        .empty("")
        .required()
        .max(15)
        .label("Mobile phone number"),
      name: Joi.object({
        first: Joi.string()
          .trim()
          .empty("")
          .required()
          .min(3)
          .max(30)
          .label("First name"),
        last: Joi.string().trim().empty("").min(3).max(30).label("Last name"),
      }).label("Name"),
      birth_date: Joi.date().required().label("Birth date"),
      gender: Joi.string()
        .trim()
        .empty("")
        .required()
        .valid(...enum_gender)
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${enum_gender.join()}.`,
        })
        .label("Gender"),
      address: joischema_address.required(),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        {
          password: _value.password,
          new_password: _value.new_password,
          confirm_new_password: _value.confirm_new_password,
          mobile_phone_number: _value.mobile_phone_number,
          name: _value.name,
          birth_date: _value.birth_date,
          gender: _value.gender,
          address: _value.address,
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
