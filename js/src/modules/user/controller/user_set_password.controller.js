const bcrypt = require("bcrypt");
const {
  joischema_user_set_password,
} = require("../joischema/user_set_password.joischema");

module.exports.method = "post";
module.exports.route_path = "/set_password";
module.exports.middlewares = [];
module.exports.is_auth_required = false;
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_user_set_password(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_user_data = await req.db_connection.models.user
    .findOne({ "set_password_token.token": body_data.set_password_token })
    .select({ _id: 1, set_password_token: 1 })
    .lean()
    .exec();

  if (
    !query_user_data ||
    !query_user_data.set_password_token ||
    !query_user_data.set_password_token.created_at ||
    __moment().isSameOrAfter(
      __moment(query_user_data.set_password_token.created_at).add(
        process.env.DEFAULT_RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS,
        "ms"
      )
    )
  ) {
    throw {
      _status: 400,
      _code: "not_exists",
      _message: "Link is invalid or expired.",
    };
  }

  await req.db_connection.models.user.updateMany(
    { _id: query_user_data._id },
    {
      password: bcrypt.hashSync(
        body_data.password,
        parseInt(process.env.HASH_SALT_ROUNDS, 10)
      ),
      $unset: { set_password_token: 1 },
    }
  );

  return { _message: "Password set successfully." };
};
