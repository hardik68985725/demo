const {
  my_db: { mongodb_objectid },
} = require("../../../helpers/helpers.index");
const { joischema_role_update } = require("../joischema/role_update.joischema");
const {
  utility: { escape_regexp },
} = require("../../../helpers/helpers.index");

module.exports.method = "patch";
module.exports.route_path = "/:_id";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_role_update({
    ...req.body,
    ...req.params,
  });
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const query_role_data_by_id = await req.db_connection.models.role
    .findOne({ _id: body_data._id })
    .select({ created_by: 1 })
    .lean()
    .exec();
  if (!query_role_data_by_id) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }
  if (
    !req._auth.is_system_owner &&
    !new mongodb_objectid(query_role_data_by_id.created_by).equals(
      req._auth.created_by
    )
  ) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const query_role_data_by_name = await req.db_connection.models.role
    .findOne({ name: new RegExp(`^${escape_regexp(body_data.name)}$`, "i") })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (query_role_data_by_name) {
    if (
      !new mongodb_objectid(body_data._id).equals(query_role_data_by_name._id)
    ) {
      throw {
        _status: 400,
        _code: "already_exists",
        _message: `${body_data.name} is already exists.`,
      };
    }
  }

  const query_updated_role_data =
    await req.db_connection.models.role.updateMany(
      { _id: body_data._id },
      {
        updated_by: req._auth.created_by,
        name: body_data.name,
        have_rights: body_data.have_rights,
      }
    );
  if (!(query_updated_role_data?.modifiedCount > 0)) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  return { _message: "Role updated successfully." };
};
