const {
  utility: { get_pagination_pipeline, escape_regexp },
  my_type: { get_boolean, is_an_empty_object },
} = require("../../../helpers/helpers.index");

module.exports.method = "get";
module.exports.route_path = "/";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const pagination_pipeline = get_pagination_pipeline({
    page_no: req.query.page_no,
    rows_per_page: req.query.rows_per_page,
    data_list_field_name: "role_list",
  });

  const _match_search = {};
  if (req.query.search_text && req.query.search_text.trim().length > 0) {
    _match_search.$or = [
      {
        name: {
          $regex: new RegExp(escape_regexp(req.query.search_text.trim()))
            .toString()
            .replaceAll("/", ""),
          $options: "i",
        },
      },
    ];
  }

  req.query.is_for_autocomplete = get_boolean(req.query.is_for_autocomplete);

  const _project_final_pipeline = [];
  if (!req.query.is_for_autocomplete) {
    _project_final_pipeline.push({
      $project: { _id: 1, name: 1, have_rights: 1 },
    });
  } else {
    _project_final_pipeline.push({
      $project: { _id: 1, name: 1 },
    });
  }

  const query_role_aggregation = [
    { $match: _match_search },

    ..._project_final_pipeline,

    ...pagination_pipeline,
  ];

  let query_role_data = await req.db_connection.models.role
    .aggregate(query_role_aggregation)
    .exec();
  query_role_data = is_an_empty_object(query_role_data[0])
    ? null
    : query_role_data[0];

  return { _data: query_role_data };
};
