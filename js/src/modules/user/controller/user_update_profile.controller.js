const bcrypt = require("bcrypt");
const {
  joischema_user_update_profile,
} = require("../joischema/user_update_profile.joischema");

module.exports.method = "patch";
module.exports.route_path = "/profile/update";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_user_update_profile(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_user_data = await req.db_connection.models.user
    .findOne({ _id: req._auth.created_by })
    .select({ password: 1 })
    .lean()
    .exec();
  if (!query_user_data) {
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

  const update_user_data = {
    updated_by: req._auth.created_by,
    mobile_phone_number: body_data.mobile_phone_number,
    name: body_data.name,
    birth_date: body_data.birth_date,
    gender: body_data.gender,
    address: body_data.address,
  };
  if (body_data.new_password) {
    update_user_data.password = bcrypt.hashSync(
      body_data.new_password,
      parseInt(process.env.HASH_SALT_ROUNDS, 10)
    );
  }

  await req.db_connection.models.user.updateMany(
    { _id: req._auth.created_by },
    update_user_data
  );

  return { _message: "Updated successfully." };
};
