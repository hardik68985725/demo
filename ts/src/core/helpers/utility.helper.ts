const escape_regexp = (_regexp_string: String) =>
  _regexp_string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const get_random_password = () => {
  const capital_alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const small_alphabets = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "_!@#$";

  const random_number_cap = [
    random_integer(0, capital_alphabets.length - 1),
    random_integer(0, capital_alphabets.length - 1)
  ];
  const random_number_sml = [
    random_integer(0, small_alphabets.length - 1),
    random_integer(0, small_alphabets.length - 1)
  ];
  const random_number_num = [
    random_integer(0, numbers.length - 1),
    random_integer(0, numbers.length - 1)
  ];
  const random_number_sym = [
    random_integer(0, symbols.length - 1),
    random_integer(0, symbols.length - 1)
  ];

  const password = "".concat(
    capital_alphabets[random_number_cap[0]],
    capital_alphabets[random_number_cap[1]],
    small_alphabets[random_number_sml[0]],
    small_alphabets[random_number_sml[1]],
    numbers[random_number_num[0]],
    numbers[random_number_num[1]],
    symbols[random_number_sym[0]],
    symbols[random_number_sym[1]]
  );

  return password;
};

const random_integer = (_min: number, _max: number) => {
  if (!_min) {
    _min = 0;
  }
  if (!_max) {
    _max = 1;
  }
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
};

const get_random_color = () => `#${Math.random().toString(16).slice(-6)}`;

export { escape_regexp, get_random_password, get_random_color };
