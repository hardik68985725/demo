const {
  my_type: { is_an_object },
} = require("./my_type.helper");

const is_valid_json = (_value, _is_return_data) => {
  let parsed_json = null;
  try {
    if (is_an_object(_value) || Array.isArray(_value)) {
      _value = JSON.stringify(_value);
    }
    parsed_json = JSON.parse(_value);
    if (typeof parsed_json === typeof _value) {
      return false;
    }
  } catch (_caught_error) {
    return false;
  }

  if (_is_return_data === true) {
    return parsed_json;
  }

  return true;
};

const circular_stringify = (_value) => {
  return JSON.stringify(
    _value,
    (() => {
      const seen = new WeakSet();
      return (key, value) => {
        if (is_an_object(value) && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    })()
  );
};

module.exports.my_json = { is_valid_json, circular_stringify };
