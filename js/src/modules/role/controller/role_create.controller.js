const { joischema_role_create } = require("../joischema/role_create.joischema");
const {
  utility: { escape_regexp },
} = require("../../../helpers/helpers.index");

module.exports.method = "post";
module.exports.route_path = "/";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_role_create(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_role_data_count = await req.db_connection.models.role
    .countDocuments({
      name: new RegExp(`^${escape_regexp(body_data.name)}$`, "i"),
    })
    .lean()
    .exec();
  if (query_role_data_count > 0) {
    throw {
      _status: 400,
      _code: "already_exists",
      _message: `${body_data.name} is already exists.`,
    };
  }

  await req.db_connection.models.role.insertMany({
    created_by: req._auth.created_by,
    name: body_data.name,
    have_rights: body_data.have_rights,
  });

  return { _message: "Role created successfully." };
};
