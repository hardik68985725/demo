import { ValidationErrorItem } from "joi";

const get_validation_error_messages = (errors: Array<ValidationErrorItem>) => {
  if (errors) {
    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0].message;
    }
  }
  return errors;
};

export { get_validation_error_messages };
