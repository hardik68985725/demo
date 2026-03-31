import BaseJoi, {
  StringSchema,
  Root,
  AsyncValidationOptions,
  CustomHelpers,
  ValidationErrorItem,
  ObjectSchema,
  ValidationError
} from "joi";
import { my_db } from "./";

/**
 * Extends Joi.
 */
const _customJoi: unknown = BaseJoi.extend((joi) => ({
  type: "string",
  base: joi.string().trim().empty(""),
  messages: { "string.enum": "{#label} must be one of: {#allowedKeys}." },
  rules: {
    enum: {
      method(
        allowedValues: string[],
        allowedKeys: string[],
        isForNotAllow: boolean = false
      ) {
        return this.$_addRule({
          name: "enum",
          args: { allowedValues, allowedKeys, isForNotAllow }
        });
      },
      args: [
        {
          name: "allowedValues",
          message: '"allowedValues" must be an array of strings.',
          assert: (v: unknown): v is string[] => {
            if (!Array.isArray(v)) return false;
            for (const item of v) {
              if (typeof item !== "string") return false;
            }
            return true;
          }
        },
        {
          name: "allowedKeys",
          message: '"allowedKeys" must be an array of strings.',
          assert: (v: unknown): v is string[] => {
            if (!Array.isArray(v)) return false;
            for (const item of v) {
              if (typeof item !== "string") return false;
            }
            return true;
          }
        },
        {
          name: "isForNotAllow",
          message: '"isForNotAllow" must be a boolean.',
          assert: (v: unknown): v is boolean => typeof v === "boolean"
        }
      ],
      validate(value, helpers, args, _options) {
        const isNotAllowed = args.isForNotAllow
          ? args.allowedValues.includes(value)
          : !args.allowedValues.includes(value);

        if (isNotAllowed) {
          return helpers.error("string.enum", {
            allowedKeys: args.allowedKeys.join(", ")
          });
        }

        return value;
      }
    }
  }
}));

interface ExtendedJoi {
  string(): StringSchema & {
    enum(
      values: string[],
      allowedKeys: string[],
      isForNotAllow?: boolean
    ): StringSchema;
  };
}

const _MyJoi = _customJoi as ExtendedJoi & Root;
/**
 * /Extends Joi.
 */

const validationMessagesList = {
  "any.invalid": "{#label} is invalid.",
  "any.required": "{#label} is required.",
  "array.base": "{#label} is invalid.",
  "date.base": "{#label} is invalid.",
  "number.base": "{#label} is invalid. It must be a number.",
  "number.min": "{#label} must be greater than or equal to {#limit}.",
  "number.max": "{#label} must be less than or equal to {#limit}.",
  "object.base": "{#label} is invalid.",
  "string.base": "{#label} is invalid.",
  "string.email": "{#label} is invalid.",
  "string.length":
    "{#label} is invalid. Length must be {#limit} characters long.",
  "string.max": "{#label} is invalid.",
  "string.min": "{#label} is invalid.",
  "string.enum": "{#label} is invalid. Value must be among {#allowedKeys}."
} as const;

const getValidationErrorMessages = (
  errors: ValidationErrorItem[] | undefined
) => {
  if (errors) {
    if (Array.isArray(errors) && errors.length > 0) {
      return errors[0].message;
    }
  }
  return errors;
};

const getDefaultValidateOptions = () => {
  return {
    abortEarly: false,
    stripUnknown: true,
    errors: { wrap: { label: false } }
  } as AsyncValidationOptions;
};

const customIsMongodbObjectId = (_value: any, _helpers: CustomHelpers) => {
  return !my_db.isMongodbObjectId(_value)
    ? _helpers.error("any.invalid")
    : _value;
};

export {
  _MyJoi as Joi,
  ValidationErrorItem,
  ObjectSchema,
  ValidationError,
  validationMessagesList,
  getValidationErrorMessages,
  getDefaultValidateOptions,
  customIsMongodbObjectId
};
