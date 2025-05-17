const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: {
    joi_get_messages_list,
    joi_get_default_validate_options,
    joi_custom_is_mongodb_objectid,
  },
} = require("../../../helpers/helpers.index");

module.exports.joischema_product_status = async (_value) => {
  try {
    const body_data = await Joi.object({
      tenant: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Tenant id"),
      status: Joi.string()
        .trim()
        .empty("")
        .required()
        .valid("approved", "pending")
        .insensitive()
        .label("Product Status"),
      product: Joi.array()
        .items(
          Joi.string().trim().empty("").custom(joi_custom_is_mongodb_objectid)
        )
        .required()
        .label("Product Ids"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        {
          tenant: _value.tenant,
          status: _value.status,
          product: _value.product,
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
