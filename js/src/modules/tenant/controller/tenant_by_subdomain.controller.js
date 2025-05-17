const { mw_throttle } = require("../../../middlewares/middlewares.index");
const {
  my_url: { is_a_valid_subdomain },
} = require("../../../helpers/helpers.index");

// -----------------------------------------------------------------------------

module.exports.method = "get";
module.exports.route_path = "/by_subdomain";
module.exports.middlewares = [mw_throttle(50)];
module.exports.is_auth_required = false;
module.exports.controller = async (req) => {
  const _subdomain = req.get("app-subdomain")?.toString()?.trim();
  if (
    !(_subdomain && _subdomain.length > 0 && is_a_valid_subdomain(_subdomain))
  ) {
    throw {
      _status: 401,
      _code: "invalid_organization_subdomain",
      _message: "Invalid organization",
    };
  }

  const query_tenant_data = await req.db_connection.models.tenant
    .findOne({ subdomain: _subdomain })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (!query_tenant_data) {
    throw {
      _status: 401,
      _code: "invalid_organization",
      _message: "Invalid organization",
    };
  }

  return { _data: query_tenant_data._id };
};
