import { tmpdir } from "node:os";

// LOAD .ENV VARIABLES
import { config as de_config } from "dotenv";
de_config();
// /LOAD .ENV VARIABLES

// -------------------------------------------------------------------------------------------------
if (
  !(
    process.env.ENV_NAME &&
    process.env.ENV_NAME.toString().trim() &&
    ["development", "staging", "production"].includes(
      process.env.ENV_NAME.toString().trim()
    )
  )
) {
  console.log("APP_LOG_POINT - ENV_SETUP_ERROR > ENV_NAME IS NOT CONFIGURED.");
  process.exit(1);
}
process.env.ENV_NAME = process.env.ENV_NAME.toString().trim();

if (
  !(
    process.env.PORT &&
    process.env.PORT.toString().trim() &&
    Number.isSafeInteger(Number(process.env.PORT.toString().trim()))
  )
) {
  console.log("APP_LOG_POINT - ENV_SETUP_ERROR > PORT IS NOT CONFIGURED.");
  process.exit(1);
}
process.env.PORT = process.env.PORT.toString().trim();

if (
  !(
    process.env.DB_CONNECTION_URL &&
    process.env.DB_CONNECTION_URL.toString().trim()
  )
) {
  console.log(
    "APP_LOG_POINT - ENV_SETUP_ERROR > DB_CONNECTION_URL IS NOT CONFIGURED."
  );
  process.exit(1);
}
process.env.DB_CONNECTION_URL = process.env.DB_CONNECTION_URL.toString().trim();

if (
  !(
    process.env.PROJECT_PUBLIC_URL &&
    process.env.PROJECT_PUBLIC_URL.toString().trim()
  )
) {
  console.log(
    "APP_LOG_POINT - ENV_SETUP_ERROR > PROJECT_PUBLIC_URL IS NOT CONFIGURED."
  );
  process.exit(1);
}
process.env.PROJECT_PUBLIC_URL =
  process.env.PROJECT_PUBLIC_URL.toString().trim();

if (
  !(
    process.env.MAIN_SERVER_URL && process.env.MAIN_SERVER_URL.toString().trim()
  )
) {
  console.log(
    "APP_LOG_POINT - ENV_SETUP_ERROR > MAIN_SERVER_URL IS NOT CONFIGURED."
  );
  process.exit(1);
}
process.env.MAIN_SERVER_URL = process.env.MAIN_SERVER_URL.toString().trim();
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
if (
  process.env.ENV_NAME !== "development" &&
  !(
    process.env.AWS_SES_FROM_EMAIL &&
    process.env.AWS_SES_FROM_EMAIL.toString().trim()
  )
) {
  console.log(
    "APP_LOG_POINT - ENV_SETUP_ERROR > AWS_SES_FROM_EMAIL IS NOT CONFIGURED."
  );
  process.exit(1);
}
process.env.AWS_SES_FROM_EMAIL =
  process.env.AWS_SES_FROM_EMAIL?.toString().trim();

if (
  process.env.ENV_NAME !== "development" &&
  !(
    process.env.AWS_SES_ACCESS_KEY_ID &&
    process.env.AWS_SES_ACCESS_KEY_ID.toString().trim()
  )
) {
  console.log(
    "APP_LOG_POINT - ENV_SETUP_ERROR > AWS_SES_ACCESS_KEY_ID IS NOT CONFIGURED."
  );
  process.exit(1);
}
process.env.AWS_SES_ACCESS_KEY_ID =
  process.env.AWS_SES_ACCESS_KEY_ID?.toString().trim();

if (
  process.env.ENV_NAME !== "development" &&
  !(
    process.env.AWS_SES_SECRET_ACCESS_KEY &&
    process.env.AWS_SES_SECRET_ACCESS_KEY.toString().trim()
  )
) {
  console.log(
    "APP_LOG_POINT - ENV_SETUP_ERROR > AWS_SES_SECRET_ACCESS_KEY IS NOT CONFIGURED."
  );
  process.exit(1);
}
process.env.AWS_SES_SECRET_ACCESS_KEY =
  process.env.AWS_SES_SECRET_ACCESS_KEY?.toString().trim();
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
if (
  !(
    process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS &&
    process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim() &&
    Number.isSafeInteger(
      Number(process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS)
    )
  ) ||
  parseInt(
    process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim(),
    10
  ) < 3600000 ||
  parseInt(
    process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim(),
    10
  ) > 7200000
) {
  process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS = "3600000"; // AN HOUR
}
process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS =
  process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim();

if (
  !(
    process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS &&
    process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim() &&
    Number.isSafeInteger(
      Number(process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS)
    )
  ) ||
  parseInt(
    process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim(),
    10
  ) < 3600000 ||
  parseInt(
    process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim(),
    10
  ) > 7200000
) {
  process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS = "3600000"; // AN HOUR
}
process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS =
  process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim();
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
process.env.AWS_S3_BUCKET_NAME = "demo";
if (process.env.ENV_NAME === "production") {
  process.env.AWS_S3_BUCKET_NAME = "demo";
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
process.env.HASH_SALT_ROUNDS = "10";
process.env.MEDIA_UPLOAD_DIRECTORY = tmpdir();
// -------------------------------------------------------------------------------------------------
