const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: {
    joi_get_messages_list,
    joi_get_default_validate_options,
    joi_custom_is_mongodb_objectid,
  },
} = require("../../../helpers/helpers.index");

module.exports.joischema_product_view = async (_value) => {
  try {
    const body_data = await Joi.object({
      _id: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Product id"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        { _id: _value._id },
        { ...joi_get_default_validate_options() }
      );
    return { body_data };
  } catch (_caught_error) {
    return {
      validation_errors: get_validation_error_messages(_caught_error?.details),
    };
  }
};
