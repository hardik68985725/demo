import { AsyncValidationOptions, CustomHelpers } from "joi";
import { my_db } from "./";

const get_messages_list = () => {
  return {
    "any.invalid": "{#label} is invalid",
    "any.required": "{#label} is required",
    "array.base": "{#label} is invalid",
    "date.base": "{#label} is invalid",
    "number.base": "{#label} is invalid. It must be a number.",
    "number.min": "{#label} must be greater than or equal to {#limit}.",
    "number.max": "{#label} must be less than or equal to {#limit}.",
    "object.base": "{#label} is invalid",
    "string.base": "{#label} is invalid",
    "string.email": "{#label} is invalid",
    "string.length":
      "{#label} is invalid. Length must be {#limit} characters long.",
    "string.max": "{#label} is invalid",
    "string.min": "{#label} is invalid"
  };
};

const get_default_validate_options = () => {
  return {
    abortEarly: false,
    stripUnknown: true,
    errors: { wrap: { label: false } }
  } as AsyncValidationOptions;
};

const custom_is_mongodb_objectid = (_value: any, _helpers: CustomHelpers) => {
  return !my_db.is_mongodb_objectid(_value)
    ? _helpers.error("any.invalid")
    : _value;
};

export {
  get_messages_list,
  get_default_validate_options,
  custom_is_mongodb_objectid
};
