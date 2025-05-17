const Joi = require("joi");
const {
  get_validation_error_messages,
  my_joi: {
    joi_get_messages_list,
    joi_get_default_validate_options,
    joi_custom_is_mongodb_objectid,
  },
} = require("../../../helpers/helpers.index");
const {
  service_product: {
    config: { enum_product_status },
  },
} = require("../service/product.service");

module.exports.joischema_tenant_product_read = async (_value) => {
  try {
    const body_data = await Joi.object({
      tenant: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Organization"),
      status: Joi.string()
        .trim()
        .empty("")
        .valid(...enum_product_status)
        .insensitive()
        .default(enum_product_status[1])
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${enum_product_status.join()}.`,
        })
        .label("Product Status"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        { tenant: _value.tenant, status: _value.status },
        { ...joi_get_default_validate_options() }
      );
    return { body_data };
  } catch (_caught_error) {
    return {
      validation_errors: get_validation_error_messages(_caught_error?.details),
    };
  }
};
