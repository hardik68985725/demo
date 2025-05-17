const { check_role } = require("./check_role.service");

// -----------------------------------------------------------------------------

const config = Object.freeze({
  enum_permission_for_modules: ["tenant"],
  enum_permission_names: ["inactive", "read", "write"],
});

module.exports.service_role = { config, check_role };
