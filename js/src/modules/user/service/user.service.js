const {
  get_system_auth_user_data,
} = require("./get_system_auth_user_data.service");

// -----------------------------------------------------------------------------

const config = Object.freeze({
  enum_gender: ["male", "female"],
});

module.exports.service_user = { config, get_system_auth_user_data };
