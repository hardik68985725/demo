import { tmpdir } from "node:os";
import { config as deConfig } from "dotenv";
deConfig();
import { my_joi } from "@app_root/core/helpers";
import { CoreEnums } from "@app_root/core/enums";

const { error, value: validatedEnv } = my_joi.Joi.object({
  ENV_NAME: my_joi.Joi.string()
    .required()
    .insensitive()
    .enum(Object.values(CoreEnums.EEnvs), Object.keys(CoreEnums.EEnvs))
    .messages({ "any.required": "{#label} environment variable is required." })
    .label("ENV_NAME"),

  PORT: my_joi.Joi.string()
    .required()
    .custom((value, helpers) => {
      const number = Number(value);

      if (!Number.isSafeInteger(number) || number <= 0) {
        return helpers.error("any.invalid");
      }

      return number;
    })
    .messages({
      "any.invalid":
        "{#label} is invalid. It must be a positive integer number."
    })
    .label("PORT"),

  DB_CONNECTION_URL: my_joi.Joi.string()
    .required()
    .uri()
    .messages({
      "any.required": "{#label} environment variable is required.",
      "string.uri": "{#label} must be a valid URL."
    })
    .label("DB_CONNECTION_URL"),
  DB_NAME: my_joi.Joi.string().optional().default(process.env.DB_NAME),

  APP_PUBLIC_URL: my_joi.Joi.string()
    .required()
    .uri()
    .messages({
      "any.required": "{#label} environment variable is required.",
      "string.uri": "{#label} must be a valid URL."
    })
    .label("APP_PUBLIC_URL"),

  MAIN_SERVER_URL: my_joi.Joi.string()
    .required()
    .uri()
    .messages({
      "any.required": "{#label} environment variable is required.",
      "string.uri": "{#label} must be a valid URL."
    })
    .label("MAIN_SERVER_URL"),

  AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS: my_joi.Joi.number()
    .optional()
    .integer()
    .min(3600000)
    .max(7200000)
    .default(3600000)
    .messages({
      "number.min": "{#label} Must be at least 3600000 milliseconds (1 hour).",
      "number.max": "{#label} Must be at most 7200000 milliseconds (2 hours)."
    })
    .label("AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS"),

  RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS: my_joi.Joi.number()
    .optional()
    .integer()
    .min(3600000)
    .max(7200000)
    .default(3600000)
    .messages({
      "number.min": "{#label} Must be at least 3600000 milliseconds (1 hour).",
      "number.max": "{#label} Must be at most 7200000 milliseconds (2 hours)."
    })
    .label("RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS"),

  HASH_SALT_ROUNDS: my_joi.Joi.string().optional().default("10"),

  MEDIA_UPLOAD_DIRECTORY: my_joi.Joi.string().optional().default(tmpdir()),

  APP_FROM_EMAIL_ADDRESS: my_joi.Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      "any.required": "{#label} environment variable is required.",
      "any.invalid": "{#label} is invalid. It must be a valid E-Mail Address."
    })
    .label("APP_FROM_EMAIL_ADDRESS")
}).validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
  errors: { wrap: { label: false } }
});

if (error) {
  myLogger.error(
    "ENV validation failed:",
    error.details.map((d) => d.message)
  );

  process.exit(1);
}

for (const [key, value] of Object.entries(validatedEnv)) {
  process.env[key] = String(value).trim();
}
