const path = require("path");
const { existsSync, readFileSync } = require("fs");

const get_random_password = () => {
  const capital_alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const small_alphabets = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "_!@#$";

  const random_number_cap = [
    random_integer(0, capital_alphabets.length - 1),
    random_integer(0, capital_alphabets.length - 1),
  ];
  const random_number_sml = [
    random_integer(0, small_alphabets.length - 1),
    random_integer(0, small_alphabets.length - 1),
  ];
  const random_number_num = [
    random_integer(0, numbers.length - 1),
    random_integer(0, numbers.length - 1),
  ];
  const random_number_sym = [
    random_integer(0, symbols.length - 1),
    random_integer(0, symbols.length - 1),
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

const random_integer = (_min, _max) => {
  if (!_min) {
    _min = 0;
  }
  if (!_max) {
    _max = 1;
  }
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
};

const get_pagination_pipeline = (_data) => {
  let data_list_field_name = "data_list";
  if (
    _data.data_list_field_name &&
    _data.data_list_field_name.toString().trim().length > 0
  ) {
    data_list_field_name = _data.data_list_field_name.toString().trim();
  }

  let page_no = 0;
  if (_data.page_no && parseInt(_data.page_no, 10) > 0) {
    page_no = parseInt(_data.page_no, 10);
  }

  let no_of_rows_per_page = 10;
  if (_data.rows_per_page && parseInt(_data.rows_per_page, 10) > 0) {
    no_of_rows_per_page = parseInt(_data.rows_per_page, 10);
    if (_data.rows_per_page > 50) {
      no_of_rows_per_page = 50;
    }
  }

  const skip = page_no * no_of_rows_per_page;

  const _remaining_rows = {
    $subtract: ["$total_rows", no_of_rows_per_page * (page_no + 1)],
  };

  const data_pagination = [
    {
      $facet: {
        pagination: [
          { $count: "total_rows" },
          {
            $addFields: {
              remaining_rows: {
                $cond: [{ $lt: [_remaining_rows, 0] }, 0, _remaining_rows],
              },
            },
          },
        ],
        [data_list_field_name]: [
          { $skip: skip },
          { $limit: no_of_rows_per_page },
        ],
      },
    },
    {
      $addFields: {
        pagination: { $first: "$pagination" },
        [data_list_field_name]: {
          $cond: [
            {
              $and: [
                { $size: "$pagination" },
                { $gt: ["$pagination.total_rows", 0] },
              ],
            },
            `$${data_list_field_name}`,
            "$$REMOVE",
          ],
        },
      },
    },
  ];

  return data_pagination;
};

const load_image = async (_path) => {
  if (!(_path && _path.toString().trim().length > 0)) {
    return;
  }
  _path = path.join(__root_path, _path.toString().trim());
  if (!existsSync(_path)) {
    return;
  }
  return `data:image/*;base64,${Buffer.from(readFileSync(_path)).toString("base64")}`;
};

const escape_regexp = (_regexp_string) => {
  return _regexp_string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports.utility = {
  get_random_password,
  random_integer,
  get_pagination_pipeline,
  load_image,
  escape_regexp,
};
