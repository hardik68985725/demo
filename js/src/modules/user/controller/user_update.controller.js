const { joischema_user_update } = require("../joischema/user_update.joischema");
const {
  my_db: { mongodb_objectid },
  my_type: { is_an_empty_object },
} = require("../../../helpers/helpers.index");

module.exports.method = "patch";
module.exports.route_path = "/:_id";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_user_update({
    ...req.body,
    ...req.params,
  });
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  if (new mongodb_objectid(body_data._id).equals(req._auth.created_by)) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const query_user_data = await req.db_connection.models.user
    .findOne({ _id: body_data._id })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (!(query_user_data && !is_an_empty_object(query_user_data))) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const query_role_data = await req.db_connection.models.role
    .findOne({ _id: body_data.role })
    .select({ _id: 0, name: 1 })
    .lean()
    .exec();
  if (!(query_role_data && !is_an_empty_object(query_role_data))) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  await req.db_connection.models.user.updateMany(
    { _id: body_data._id },
    { updated_by: req._auth.created_by, role: body_data.role }
  );

  return { _message: "User has been updated successfully." };
};
