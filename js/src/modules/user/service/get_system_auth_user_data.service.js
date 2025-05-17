const {
  my_type: { is_an_empty_object },
} = require("../../../helpers/helpers.index");

// -----------------------------------------------------------------------------

module.exports.get_system_auth_user_data = async (_req, _auth_data) => {
  if (!_req) {
    __line_number_print;
    throw { _status: 401, _code: "unauthorized", _message: "Unauthorized" };
  }
  if (!(_auth_data && _auth_data.created_by)) {
    throw { _status: 401, _code: "invalid_token", _message: "Invalid token" };
  }

  _auth_data.is_system_auth = true;

  const user_data = await _req.db_connection.models.user
    .findOne({ _id: _auth_data.created_by })
    .select({ is_owner: 1, role: 1 })
    .lean()
    .exec();
  if (user_data?.is_owner) {
    _auth_data.is_system_owner = true;
  }

  if (user_data?.role) {
    const role_data = await _req.db_connection.models.role
      .findOne({ _id: user_data.role })
      .select({ _id: 1, name: 1, have_rights: 1 })
      .lean()
      .exec();
    if (!is_an_empty_object(role_data)) {
      _auth_data.role = role_data;
    }
  }
};
