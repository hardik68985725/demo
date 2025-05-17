module.exports.get_validation_error_messages = (_errors) => {
  const error_list = [];
  if (_errors) {
    for (const v_error of _errors) {
      error_list.push(v_error.message);
    }
  }
  return error_list;
};
