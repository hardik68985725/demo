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
    data_list_field_name: "user_list",
  });

  const _match = { _id: { $ne: req._auth.created_by } };

  const _match_search = {};
  if (req.query.search_text && req.query.search_text.trim().length > 0) {
    _match_search.$or = [
      {
        email: {
          $regex: new RegExp(escape_regexp(req.query.search_text.trim()))
            .toString()
            .replaceAll("/", ""),
          $options: "i",
        },
      },
      {
        mobile_phone_number: {
          $regex: new RegExp(escape_regexp(req.query.search_text.trim()))
            .toString()
            .replaceAll("/", ""),
          $options: "i",
        },
      },
      {
        "name.first": {
          $regex: new RegExp(escape_regexp(req.query.search_text.trim()))
            .toString()
            .replaceAll("/", ""),
          $options: "i",
        },
      },
      {
        "name.last": {
          $regex: new RegExp(escape_regexp(req.query.search_text.trim()))
            .toString()
            .replaceAll("/", ""),
          $options: "i",
        },
      },
    ];
  }

  req.query.is_for_autocomplete = get_boolean(req.query.is_for_autocomplete);

  const _lookup_pipeline_of_role = [];
  if (!req.query.is_for_autocomplete) {
    _lookup_pipeline_of_role.push(
      {
        $lookup: {
          as: "role",
          from: "roles",
          localField: "role",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $unwind: "$role" }
    );
  }

  const _project_final_pipeline = [];
  if (!req.query.is_for_autocomplete) {
    _project_final_pipeline.push({
      $project: { _id: 1, email: 1, mobile_phone_number: 1, name: 1, role: 1 },
    });
  } else {
    _project_final_pipeline.push({
      $project: { _id: 1, email: 1, name: 1 },
    });
  }

  const query_user_aggregation = [
    { $match: _match },

    { $match: _match_search },

    ..._lookup_pipeline_of_role,

    ..._project_final_pipeline,

    ...pagination_pipeline,
  ];

  let query_user_data = await req.db_connection.models.user
    .aggregate(query_user_aggregation)
    .exec();
  query_user_data = is_an_empty_object(query_user_data[0])
    ? null
    : query_user_data[0];

  return { _data: query_user_data };
};
