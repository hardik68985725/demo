const bcrypt = require("bcrypt");
const { mw_role } = require("../../../middlewares/middlewares.index");
const {
  joischema_tenant_update,
} = require("../joischema/tenant_update.joischema");
const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");

// -----------------------------------------------------------------------------

module.exports.method = "patch";
module.exports.route_path = "/:_id";
module.exports.middlewares = [mw_role("tenant", "write", true)];
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_tenant_update({
    ...req.body,
    ...req.params,
  });
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_update_tenant = { _id: body_data._id };
  if (
    !(
      req._auth.is_system_owner ||
      req._auth.is_tenant_owner ||
      req._auth.can_access
    )
  ) {
    query_update_tenant.created_by = req._auth.created_by;
  }
  const updated_tenant_data = await req.db_connection.models.tenant.updateMany(
    query_update_tenant,
    {
      updated_by: req._auth.created_by,
      name: body_data.name,
      address: body_data.address,
      business_day: body_data.business_day,
      timezone: body_data.timezone,
      mqtt_topic: body_data.mqtt_topic,
      blukii_hub_id: body_data.blukii_hub_id,
      currency: body_data.currency,
    }
  );
  if (updated_tenant_data?.modifiedCount > 0) {
    const tenant_owner_data = await req.db_connection.models.tenant
      .findOne({ _id: body_data._id })
      .select({ _id: 1, tenant_owner: 1 })
      .lean()
      .exec();
    if (tenant_owner_data?.tenant_owner) {
      const tenant_db_connection = await connect_to_db(
        process.env.TENANT_DB_NAME_PREFIX.concat(body_data._id)
      );

      const update_user_data = {
        updated_by: req._auth.created_by,
        name: body_data.tenant_owner.name,
        address: body_data.tenant_owner.address,
        mobile_phone_number: body_data.tenant_owner.mobile_phone_number,
        tenant_data: { business_day: body_data.business_day },
      };

      if (body_data?.tenant_owner?.password) {
        update_user_data.password = bcrypt.hashSync(
          body_data.tenant_owner.password,
          parseInt(process.env.HASH_SALTROUNDS, 10)
        );
      }

      await tenant_db_connection.models.user.updateMany(
        { _id: tenant_owner_data.tenant_owner },
        update_user_data
      );

      await tenant_db_connection.close();
      return { _message: "Tenant updated successfully." };
    }
  }

  return { _message: "Tenant updated successfully with tenant details only." };
};
