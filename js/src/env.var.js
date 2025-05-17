const { tmpdir } = require("node:os");

// LOAD .ENV VARIABLES
require("dotenv").config();
// /LOAD .ENV VARIABLES
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
if (
  !(
    process.env.ENV_NAME &&
    process.env.ENV_NAME.toString().trim().length > 0 &&
    ["development", "staging", "production"].includes(
      process.env.ENV_NAME.toString().trim()
    )
  )
) {
  console.log(">>>>> ENV_SETUP_ERROR > ENV_NAME IS NOT CONFIGURED.");
  process.exit(1);
}
process.env.ENV_NAME = process.env.ENV_NAME.toString().trim();

if (
  !(
    process.env.PORT &&
    process.env.PORT.toString().trim().length > 0 &&
    Number.isSafeInteger(Number(process.env.PORT.toString().trim()))
  )
) {
  console.log(">>>>> ENV_SETUP_ERROR > PORT IS NOT CONFIGURED.");
  process.exit(1);
}
process.env.PORT = parseInt(process.env.PORT.toString().trim(), 10);

if (
  !(
    process.env.DB_CONNECTION_URL &&
    process.env.DB_CONNECTION_URL.toString().trim().length > 0
  )
) {
  console.log(">>>>> ENV_SETUP_ERROR > DB_CONNECTION_URL IS NOT CONFIGURED.");
  process.exit(1);
}
process.env.DB_CONNECTION_URL = process.env.DB_CONNECTION_URL.toString().trim();
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
// SET RESET_CONSOLE ENVIRONMENT.
if (
  !(
    process.env.RESET_CONSOLE &&
    process.env.RESET_CONSOLE.trim().length > 0 &&
    Number.isSafeInteger(Number(process.env.RESET_CONSOLE.trim()))
  )
) {
  process.env.RESET_CONSOLE = 0;
}

process.env.RESET_CONSOLE = parseInt(process.env.RESET_CONSOLE.trim(), 10);
if (process.env.RESET_CONSOLE == 1) {
  process.env.RESET_CONSOLE = 1;
} else {
  process.env.RESET_CONSOLE = 0;
}

if (process.env.ENV_NAME !== "development") {
  process.env.RESET_CONSOLE = 0;
}
// /SET RESET_CONSOLE ENVIRONMENT.

if (
  !(
    process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS &&
    process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim()
      .length > 0 &&
    Number.isSafeInteger(
      Number(process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS)
    )
  ) ||
  process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS < 3600000 ||
  process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS > 7200000
) {
  process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS = 3600000; // AN HOUR
}

if (
  !(
    process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS &&
    process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim()
      .length > 0 &&
    Number.isSafeInteger(
      Number(process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS)
    )
  ) ||
  process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS < 3600000 ||
  process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS > 7200000
) {
  process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS = 3600000; // AN HOUR
}
process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS = parseInt(
  process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS.toString().trim(),
  10
);
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
process.env.AWS_S3_BUCKET_TENANT_FOLDER_NAME_PREFIX = "tenant_";
process.env.AWS_S3_BUCKET_NAME = "demo";
if (process.env.ENV_NAME === "production") {
  process.env.AWS_S3_BUCKET_NAME = "demo";
}
// -------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------
process.env.HASH_SALTROUNDS = 10;
process.env.MEDIA_UPLOAD_DIRECTORY = tmpdir();
process.env.MASTER_DB_NAME = "master_db";
process.env.DEVICE_DB_NAME = "device_db";
process.env.TENANT_DB_NAME_PREFIX = "tenant_db_";
// -------------------------------------------------------------------------------------------------
