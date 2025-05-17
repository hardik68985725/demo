const bcrypt = require("bcrypt");
const { joischema_user_create } = require("../joischema/user_create.joischema");
const {
  my_ejs: { render_email_template },
  my_aws_ses: { send_an_email },
  my_type: { is_an_empty_object },
  utility: { get_random_password },
} = require("../../../helpers/helpers.index");

// -----------------------------------------------------------------------------

module.exports.method = "post";
module.exports.route_path = "/";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }
  const { body_data, validation_errors } = await joischema_user_create(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_user_data = await req.db_connection.models.user
    .findOne({ email: body_data.email })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (query_user_data && !is_an_empty_object(query_user_data)) {
    throw {
      _status: 400,
      _code: "already_exists",
      _message: `${body_data.email} is already exists.`,
    };
  }

  const query_role_data = await req.db_connection.models.role
    .findOne({ _id: body_data.role })
    .select({ _id: 0, name: 1 })
    .lean()
    .exec();
  if (!(query_role_data && !is_an_empty_object(query_role_data))) {
    throw { _status: 403, _code: "not_exists", _message: "Role is invalid" };
  }

  const new_user_data = {
    created_by: req._auth.created_by,
    email: body_data.email,
    role: body_data.role,
    set_password_token: {
      created_at: new Date(),
      token: bcrypt.hashSync(
        get_random_password(),
        parseInt(process.env.HASH_SALT_ROUNDS, 10)
      ),
    },
  };
  await req.db_connection.models.user.insertMany(new_user_data);

  // SEND AN EMAIL
  const email_subject = "Demo - Registration";
  const signin_url = process.env.PROJECT_PUBLIC_URL.toString()
    .trim()
    .split("//")
    .join("//".concat("system", "."));
  const set_password_url = signin_url.concat(
    "/",
    "user",
    "/",
    "set-password",
    "?",
    "_spt",
    "=",
    new_user_data.set_password_token.token
  );
  const email_content = await render_email_template(
    "user_create.ejs",
    email_subject,
    {
      signin_url: signin_url,
      set_password_url: set_password_url,
      role_name: query_role_data.name,
    }
  );
  await send_an_email(body_data.email, email_subject, email_content);
  // /SEND AN EMAIL

  return {
    _message: `User has been created successfully with an email address ${body_data.email}.`,
  };
};
