const {
  my_type: { get_boolean },
} = require("../helpers/helpers.index");

module.exports.mw_role = mw_role;
function mw_role(_module_name, _permission, _handle_error_manually) {
  return async function mw_role(req, res, next) {
    try {
      _handle_error_manually = get_boolean(_handle_error_manually);

      req._auth.can_access = false;
      if (_module_name) {
        if (
          req._auth?.system_role?.have_rights &&
          req._auth?.system_role?.have_rights[_module_name] &&
          ["write", _permission].includes(
            req._auth?.system_role?.have_rights[_module_name]
          )
        ) {
          req._auth.can_access = true;
        }
      }

      if (!_handle_error_manually) {
        if (
          !(
            req._auth.is_system_owner ||
            req._auth.is_tenant_owner ||
            req._auth.can_access
          )
        ) {
          __line_number_print;
          throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
        }
      }
    } catch (_caught_error) {
      return next(_caught_error);
    }
    return next();
  };
}
