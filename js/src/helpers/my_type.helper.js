const get_boolean = (_value) => {
  const falsy_expression = /^(?:f(?:alse)?|no?|0+)$/i;
  return !falsy_expression.test(_value) && !!_value;
};

const is_valid_variable_name = (_value) => {
  if (
    _value &&
    (typeof _value).toLowerCase() === "string" &&
    _value.trim().length > 0
  ) {
    return RegExp(/^[a-z_]+[a-z0-9_]*$/i).test(_value);
  }
  return false;
};

const is_an_object = (_value) => {
  return _value && typeof _value === "object" && _value.constructor === Object;
};

const is_an_empty_object = (_value) => {
  return !(is_an_object(_value) && Object.keys(_value).length > 0);
};

const is_mongo_client = (_value) => {
  return (
    _value &&
    typeof _value === "object" &&
    _value?.client?.constructor?.name === "MongoClient"
  );
};

module.exports.my_type = {
  get_boolean,
  is_valid_variable_name,
  is_an_object,
  is_an_empty_object,
  is_mongo_client,
};
