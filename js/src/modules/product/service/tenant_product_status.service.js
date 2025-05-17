const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");
const {
  joischema_product_status,
} = require("../joischema/tenant_product_status.joischema");

module.exports.tenant_product_status_change = async (_req) => {
  //   if (!(_req && (_req._auth.is_tenant_owner || _req._auth.can_access))) {
  //     throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  //   }

  const { body_data, validation_errors } = await joischema_product_status({
    ..._req.body,
    ..._req.params,
  });
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  // CREATE TENANT DB CONNECTION.
  const tenant_db_connection = await connect_to_db(
    process.env.TENANT_DB_NAME_PREFIX.concat(body_data.tenant)
  );

  const productIds = body_data.product.map((id) => id);

  await tenant_db_connection.models.product.updateMany(
    { _id: { $in: productIds } },
    { status: body_data.status }
  );

  await tenant_db_connection.close();
  return {
    _message: "Status updated successfully",
  };
};
