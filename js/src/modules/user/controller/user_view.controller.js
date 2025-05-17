const {
  my_type: { is_an_empty_object },
  my_db: { mongodb_objectid },
} = require("../../../helpers/helpers.index");
const { joischema_user_view } = require("../joischema/user_view.joischema");

module.exports.method = "get";
module.exports.route_path = "/profile/:_id?";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_user_view(
    req.params
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  if (!req._auth.is_system_owner && body_data._id) {
    throw { _status: 400, _code: "forbidden", _message: "Forbidden" };
  }

  const _match = { _id: req._auth.created_by };
  if (body_data._id) {
    _match._id = new mongodb_objectid(body_data._id);
  }

  let _lookup_pipeline_of_role = [];
  if (!new mongodb_objectid(_match._id).equals(req._auth.created_by)) {
    _lookup_pipeline_of_role.push(
      {
        $lookup: {
          as: "role",
          from: "roles",
          localField: "role",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1, have_rights: 1 } }],
        },
      },
      { $unwind: "$role" }
    );
  }

  const _project_final_pipeline = [
    {
      $project: {
        _id: 1,
        email: 1,
        role: 1,
        mobile_phone_number: 1,
        name: 1,
        birth_date: 1,
        gender: 1,
        address: 1,
      },
    },
  ];
  if (!req._auth.is_system_owner) {
    delete _project_final_pipeline[0].$project.role;
  }

  const query_user_aggregation = [
    { $match: _match },

    ..._lookup_pipeline_of_role,

    ..._project_final_pipeline,
  ];

  let query_user_data = await req.db_connection.models.user
    .aggregate(query_user_aggregation)
    .exec();
  query_user_data = is_an_empty_object(query_user_data[0])
    ? null
    : query_user_data[0];

  return { _data: query_user_data };
};
