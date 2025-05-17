const { joischema_role_delete } = require("../joischema/role_delete.joischema");

module.exports.method = "delete";
module.exports.route_path = "/:_id";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_role_delete(
    req.params
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_user_data_count = await req.db_connection.models.user
    .countDocuments({ role: body_data._id })
    .lean()
    .exec();
  if (query_user_data_count > 0) {
    throw {
      _status: 403,
      _code: "assigned_role",
      _message: "Assigned roles cannot be removed.",
    };
  }

  const query_deleted_role_data =
    await req.db_connection.models.role.deleteMany({
      _id: body_data._id,
    });
  if (!(query_deleted_role_data?.deletedCount > 0)) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  return { _message: "Role deleted successfully." };
};
