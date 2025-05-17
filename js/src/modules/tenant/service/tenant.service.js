const { get_tenant_auth } = require("./get_tenant_auth.service");
const { service_role } = require("./tenant_role.service");

const config = Object.freeze({});

module.exports.service_tenant = { config, get_tenant_auth, service_role };
