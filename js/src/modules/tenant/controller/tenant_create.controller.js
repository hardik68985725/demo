const bcrypt = require("bcrypt");
const { mw_role } = require("../../../middlewares/middlewares.index");
const {
  joischema_tenant_create,
} = require("../joischema/tenant_create.joischema");
const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");
const {
  my_ejs: { render_email_template },
  my_aws_ses: { send_an_email },
  utility: { get_random_password, escape_regexp },
} = require("../../../helpers/helpers.index");

// -----------------------------------------------------------------------------

module.exports.method = "post";
module.exports.route_path = "/";
module.exports.middlewares = [mw_role("tenant", "write")];
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_tenant_create(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const tenant_data_count_by_subdomain = await req.db_connection.models.tenant
    .countDocuments({
      subdomain: new RegExp(`^${escape_regexp(body_data.subdomain)}$`, "i"),
    })
    .lean()
    .exec();
  if (tenant_data_count_by_subdomain > 0) {
    throw {
      _status: 400,
      _code: "already_exists",
      _message: `${body_data.subdomain} is already exists.`,
    };
  }

  const new_tenant = await req.db_connection.models.tenant.insertMany({
    created_by: req._auth.created_by,
    subdomain: body_data.subdomain,
    name: body_data.name,
    address: body_data.address,
    business_day: body_data.business_day,
    timezone: body_data.timezone,
    mqtt_topic: body_data.mqtt_topic,
    blukii_hub_id: body_data.blukii_hub_id,
    currency: body_data.currency,
  });
  if (new_tenant && Array.isArray(new_tenant) && new_tenant.length > 0) {
    const tenant_db_connection = await connect_to_db(
      process.env.TENANT_DB_NAME_PREFIX.concat(new_tenant[0]._id)
    );

    const new_user_insert_data = {
      created_by: req._auth.created_by,
      email: body_data.tenant_owner.email,
      is_owner: true,
      name: body_data.tenant_owner.name,
      address: body_data.tenant_owner.address,
      mobile_phone_number: body_data.tenant_owner.mobile_phone_number,
      set_password_token: {
        created_at: new Date(),
        token: bcrypt.hashSync(
          get_random_password(),
          parseInt(process.env.HASH_SALTROUNDS, 10)
        ),
      },
      tenant_data: { business_day: body_data.business_day },
    };
    const query_tenant_user_owner_data =
      await tenant_db_connection.models.user.insertMany(new_user_insert_data);
    await tenant_db_connection.close();

    if (
      query_tenant_user_owner_data &&
      Array.isArray(query_tenant_user_owner_data) &&
      query_tenant_user_owner_data.length > 0
    ) {
      await req.db_connection.models.tenant.updateMany(
        { _id: new_tenant[0]._id },
        {
          updated_by: req._auth.created_by,
          tenant_owner: query_tenant_user_owner_data[0]._id,
        }
      );
    }

    // SEND AN EMAIL
    const email_subject = "Demo - Registration";
    const signin_url = process.env.PROJECT_PUBLIC_URL.toString()
      .trim()
      .split("//")
      .join("//".concat(body_data.subdomain, "."));
    const set_password_url = signin_url.concat(
      "/",
      "user",
      "/",
      "set-password",
      "?",
      "_spt",
      "=",
      new_user_insert_data.set_password_token.token
    );
    console.log(set_password_url);
    const email_content = await render_email_template(
      "tenant_create.ejs",
      email_subject,
      {
        signin_url: signin_url,
        set_password_url: set_password_url,
        subdomain: body_data.subdomain,
      }
    );
    await send_an_email(
      body_data.tenant_owner.email,
      email_subject,
      email_content
    );
    // /SEND AN EMAIL
  }

  return { _message: "Tenant created successfully." };
};
