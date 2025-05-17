const bcrypt = require("bcrypt");
const {
  my_ejs: { render_email_template },
  my_aws_ses: { send_an_email },
  utility: { get_random_password },
} = require("../../../helpers/helpers.index");
const {
  joischema_user_reset_password_request,
} = require("../joischema/user_reset_password_request.joischema");

module.exports.method = "post";
module.exports.route_path = "/reset_password_request";
module.exports.middlewares = [];
module.exports.is_auth_required = false;
module.exports.controller = async (req) => {
  const { body_data, validation_errors } =
    await joischema_user_reset_password_request(req.body);
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_user_data = await req.db_connection.models.user
    .findOne({ email: body_data.email })
    .select({ _id: 1, set_password_token: 1 })
    .lean()
    .exec();
  if (!query_user_data) {
    throw {
      _status: 400,
      _code: "not_exists",
      _message: "Email does not exists.",
    };
  }

  if (
    query_user_data.set_password_token &&
    query_user_data.set_password_token.created_at &&
    !__moment().isSameOrAfter(
      __moment(query_user_data.set_password_token.created_at).add(
        process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS,
        "ms"
      )
    )
  ) {
    throw {
      _status: 400,
      _code: "request_limit",
      _message:
        "You can request after an hour from the last request to set the password.",
    };
  }

  const update_user_data = {
    set_password_token: {
      created_at: new Date(),
      token: bcrypt.hashSync(
        get_random_password(),
        parseInt(process.env.HASH_SALT_ROUNDS, 10)
      ),
    },
  };

  await req.db_connection.models.user.updateMany(
    { _id: query_user_data._id },
    update_user_data
  );

  // SEND AN EMAIL
  const email_subject = "Demo - Reset Password";
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
    update_user_data.set_password_token.token
  );
  const email_content = await render_email_template(
    "reset_password_request.ejs",
    email_subject,
    { set_password_url: set_password_url }
  );
  await send_an_email(body_data.email, email_subject, email_content);
  // /SEND AN EMAIL

  return {
    _message: "Check your email inbox to set the password.",
  };
};
