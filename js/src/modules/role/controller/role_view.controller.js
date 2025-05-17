const {
  my_type: { is_an_empty_object },
} = require("../../../helpers/helpers.index");
const { joischema_role_view } = require("../joischema/role_view.joischema");

module.exports.method = "get";
module.exports.route_path = "/view/:_id?";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_role_view(
    req.params
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const _match = {};
  if (body_data._id) {
    _match._id = body_data._id;
  }
  if (req._auth.system_role) {
    _match._id = req._auth.system_role;
  }

  if (is_an_empty_object(_match)) {
    return { _data: null };
  }

  const query_role_data = await req.db_connection.models.role
    .findOne(_match)
    .select({ _id: 1, name: 1, have_rights: 1 })
    .lean()
    .exec();

  return { _data: query_role_data };
};
