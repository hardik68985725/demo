const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");
const {
  my_url: { is_a_valid_subdomain },
  my_type: { is_an_empty_object },
} = require("../../../helpers/helpers.index");

// -----------------------------------------------------------------------------

module.exports.get_tenant_auth = async (_req, _token) => {
  if (!_req) {
    __line_number_print;
    throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
  }
  if (!_token) {
    throw { _status: 401, _code: "invalid_token", _message: "Invalid token" };
  }

  const _subdomain = _req.get("app-subdomain")?.toString()?.trim();
  if (
    !(_subdomain && _subdomain.length > 0 && is_a_valid_subdomain(_subdomain))
  ) {
    __line_number_print;
    throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
  }

  const query_tenant_data = await _req.db_connection.models.tenant
    .findOne({ subdomain: _subdomain })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (!query_tenant_data) {
    __line_number_print;
    throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
  }

  const tenant_db_connection = await connect_to_db(
    process.env.TENANT_DB_NAME_PREFIX.concat(query_tenant_data._id)
  );

  const auth_data = await tenant_db_connection.models.auth
    .findOne({ token: _token })
    .select({ created_by: 1, created_at: 1 })
    .lean()
    .exec();

  if (auth_data) {
    auth_data.tenant = query_tenant_data._id;

    const user_data = await tenant_db_connection.models.user
      .findOne({ _id: auth_data.created_by })
      .select({ is_owner: 1, role: 1 })
      .lean()
      .exec();
    if (user_data?.is_owner) {
      auth_data.is_tenant_owner = true;
    }

    if (user_data?.role) {
      const role_data = await tenant_db_connection.models.role
        .findOne({ _id: user_data.role })
        .select({ _id: 1, name: 1, have_rights: 1 })
        .lean()
        .exec();
      if (!is_an_empty_object(role_data)) {
        auth_data.role = role_data;
      }
    }
  }
  await tenant_db_connection.close();

  return auth_data;
};
