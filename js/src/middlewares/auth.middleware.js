const {
  service_tenant: { get_tenant_auth },
} = require("../modules/tenant/service/tenant.service");
const {
  service_user: { get_system_auth_user_data },
} = require("../modules/user/service/user.service");

// -----------------------------------------------------------------------------

module.exports.mw_auth = mw_auth;
async function mw_auth(req, res, next) {
  try {
    const authorization = req.headers["authorization"];
    if (!authorization) {
      throw {
        _status: 401,
        _code: "required_token",
        _message: "Required token",
      };
    }

    const bearer = authorization.split(" ");
    const token = bearer[1] || null;
    if (!token) {
      throw { _status: 401, _code: "invalid_token", _message: "Invalid token" };
    }

    let auth_data = await req.db_connection.models.auth
      .findOne({ token })
      .select({ created_by: 1, created_at: 1 })
      .lean()
      .exec();
    if (!auth_data) {
      auth_data = await get_tenant_auth(req, token);
    } else {
      await get_system_auth_user_data(req, auth_data);
    }

    if (!auth_data) {
      __line_number_print;
      throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
    }

    if (
      __moment().isSameOrAfter(
        __moment(auth_data.created_at).add(
          process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS,
          "ms"
        )
      )
    ) {
      throw { _status: 401, _code: "token_expired", _message: "Token expired" };
    }

    req._auth = { created_by: auth_data.created_by };

    if (auth_data.is_system_auth) {
      if (auth_data.is_system_owner) {
        req._auth.is_system_owner = true;
      } else {
        req._auth.system_role = auth_data.role;
      }
    } else if (auth_data.tenant) {
      req._auth.tenant = auth_data.tenant;
      if (auth_data.is_tenant_owner) {
        req._auth.is_tenant_owner = true;
      } else {
        req._auth.role = auth_data.role;
      }
    } else {
      __line_number_print;
      throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
    }
  } catch (_caught_error) {
    return next(_caught_error);
  }

  return next();
}
