const bcrypt = require("bcrypt");
const { create_auth } = require("../service/create_auth.service");
const { joischema_auth_create } = require("../joischema/auth_create.joischema");

module.exports.method = "post";
module.exports.route_path = "/";
module.exports.middlewares = [];
module.exports.is_auth_required = false;
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_auth_create(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_user_data = await req.db_connection.models.user
    .findOne({ email: body_data.email })
    .select({ _id: 1, password: 1, is_owner: 1, role: 1 })
    .lean()
    .exec();
  if (
    !(
      query_user_data &&
      query_user_data.password &&
      query_user_data.password.trim().length > 0
    )
  ) {
    throw {
      _status: 400,
      _code: "invalid_credentials",
      _message: "Invalid credentials",
    };
  }
  const is_password_ok = bcrypt.compareSync(
    body_data.password,
    query_user_data.password
  );
  if (!is_password_ok) {
    throw {
      _status: 400,
      _code: "invalid_credentials",
      _message: "Invalid credentials",
    };
  }

  const auth_data = await create_auth(req.db_connection, query_user_data._id);

  return {
    _data: {
      token: auth_data.token,
      is_owner: query_user_data.is_owner,
      role: query_user_data.role,
    },
  };
};
