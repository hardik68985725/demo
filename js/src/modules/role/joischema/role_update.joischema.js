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
  service_role: {
    config: { enum_permission_for_modules, enum_permission_names },
  },
} = require("../service/role.service");

module.exports.joischema_role_update = async (_value) => {
  try {
    const body_data = await Joi.object({
      _id: Joi.string()
        .trim()
        .empty("")
        .required()
        .custom(joi_custom_is_mongodb_objectid)
        .label("Role id"),
      name: Joi.string()
        .trim()
        .empty("")
        .required()
        .insensitive()
        .label("Role name"),
      have_rights: Joi.object({
        tenant: Joi.string()
          .trim()
          .empty("")
          .valid(...enum_permission_names)
          .insensitive()
          .default(enum_permission_names[0])
          .messages({
            "any.only": `{#label} is invalid. Value must be among ${enum_permission_names.join()}.`,
          })
          .label("Organization permission"),
        product: Joi.string()
          .trim()
          .empty("")
          .valid(...enum_permission_names)
          .insensitive()
          .default(enum_permission_names[0])
          .messages({
            "any.only": `{#label} is invalid. Value must be among ${enum_permission_names.join()}.`,
          })
          .label("Product permission"),
        location: Joi.string()
          .trim()
          .empty("")
          .valid(...enum_permission_names)
          .insensitive()
          .default(enum_permission_names[0])
          .messages({
            "any.only": `{#label} is invalid. Value must be among ${enum_permission_names.join()}.`,
          })
          .label("Location permission"),
      })
        .required()
        .or(...enum_permission_for_modules)
        .messages({
          "object.missing": `At least one Rights has among ${enum_permission_for_modules.join()}.`,
        })
        .label("Have rights"),
    })
      .messages(joi_get_messages_list())
      .validateAsync(
        { _id: _value._id, name: _value.name, have_rights: _value.have_rights },
        { ...joi_get_default_validate_options() }
      );
    return { body_data };
  } catch (_caught_error) {
    return {
      validation_errors: get_validation_error_messages(_caught_error?.details),
    };
  }
};
