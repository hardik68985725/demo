module.exports.check_role = (_req) => {
  if (
    !(
      !_req ||
      _req?._auth?.is_system_owner ||
      _req?._auth?.is_tenant_owner ||
      _req?._auth?.can_access
    )
  ) {
    __line_number_print;
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }
};
