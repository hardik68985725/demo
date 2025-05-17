const { format: url_format } = require("url");
const { mw_role } = require("../../../middlewares/middlewares.index");
const {
  my_url: { is_valid_url },
} = require("../../../helpers/helpers.index");
const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");
const { joischema_tenant_view } = require("../joischema/tenant_view.joischema");
const {
  service_role: { check_role },
} = require("../../role/service/role.service");

// -----------------------------------------------------------------------------

const _request_from = (req) => {
  if (req.get("origin") && is_valid_url(req.get("origin"))) {
    return req.get("origin");
  }

  return url_format({
    protocol: req.protocol,
    host: req.get("host"),
    pathname: req.baseUrl,
  });
};

module.exports.method = "get";
module.exports.route_path = "/view/:_id?";
module.exports.middlewares = [mw_role("tenant", "read", true)];
module.exports.controller = async (req) => {
  if (![process.env.TENANT_SERVER_URL].includes(_request_from(req))) {
    check_role(req);
  }

  const _match = {};
  if (req._auth.tenant && req._auth.tenant.toString().trim().length > 0) {
    _match._id = req._auth.tenant.toString().trim();
  } else {
    const { body_data, validation_errors } = await joischema_tenant_view(
      req.params
    );
    if (validation_errors) {
      throw { _status: 400, _code: "bad_input", _message: validation_errors };
    }

    _match._id = body_data._id;

    if (!req._auth.is_system_owner) {
      _match.created_by = req._auth.created_by;
    }
  }

  const tenant_data = await req.db_connection.models.tenant
    .findOne(_match)
    .select({
      _id: 1,
      name: 1,
      subdomain: 1,
      address: 1,
      business_day: 1,
      timezone: 1,
      mqtt_topic: 1,
      blukii_hub_id: 1,
      currency: 1,
      tenant_owner: 1,
    })
    .lean()
    .exec();

  if (!tenant_data) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const tenant_db_connection = await connect_to_db(
    process.env.TENANT_DB_NAME_PREFIX.concat(tenant_data._id)
  );
  tenant_data.tenant_owner = await tenant_db_connection.models.user
    .findOne(tenant_data.tenant_owner)
    .select({
      _id: 0,
      email: 1,
      name: 1,
      address: 1,
      mobile_phone_number: 1,
    })
    .lean()
    .exec();
  await tenant_db_connection.close();

  return { _data: tenant_data };
};
