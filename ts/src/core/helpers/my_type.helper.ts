const get_boolean = (_value: string | undefined): boolean => {
  const falsy_expression = /^(?:f(?:alse)?|no?|0+)$/i;
  return !!_value && !falsy_expression.test(_value as string);
};

const is_valid_variable_name = (_value: string): boolean => {
  if (_value && (typeof _value).toLowerCase() === "string" && _value.trim()) {
    return RegExp(/^[a-z_]+[a-z0-9_]*$/i).test(_value);
  }
  return false;
};

const is_an_object = (_value: unknown): boolean => {
  return (
    _value !== undefined &&
    _value !== null &&
    typeof _value === "object" &&
    _value.constructor === Object
  );
};

const is_an_empty_object = (_value: unknown) => {
  return !(is_an_object(_value) && Object.keys(_value as Object).length > 0);
};

const is_valid_json = (
  _value: unknown,
  _is_return_data: boolean = false
): boolean | Record<string, unknown> => {
  let parsed_json = null;
  try {
    if (is_an_object(_value) || Array.isArray(_value)) {
      _value = JSON.stringify(_value);
    }
    parsed_json = JSON.parse(_value as string);
    if (typeof parsed_json === typeof _value) {
      return false;
    }
  } catch (error) {
    return false;
  }

  if (_is_return_data === true) {
    return parsed_json;
  }

  return true;
};

export {
  get_boolean,
  is_valid_variable_name,
  is_an_object,
  is_an_empty_object,
  is_valid_json
};
