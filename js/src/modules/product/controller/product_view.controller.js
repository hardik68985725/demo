const {
  my_db: { mongodb_objectid },
  my_type: { is_an_empty_object },
} = require("../../../helpers/helpers.index");
const {
  joischema_product_view,
} = require("../joischema/product_view.joischema");
const {
  service_product: { update_and_get_system_product_image_file_url },
} = require("../service/product.service");

// -----------------------------------------------------------------------------

module.exports.method = "get";
module.exports.route_path = "/:_id";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_product_view(
    req.params
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const _match = { _id: new mongodb_objectid(body_data._id) };

  const _lookup_pipeline_group = [
    {
      $lookup: {
        as: "lookup_group",
        from: "groups",
        let: { v_group_id: { $toObjectId: "$group" } },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$$v_group_id", "$_id"] }] } } },
          { $project: { _id: 1, name: 1 } },
        ],
      },
    },
    { $addFields: { group: { $first: "$lookup_group" } } },
  ];

  const query_group_aggregation = [
    { $match: _match },

    ..._lookup_pipeline_group,

    {
      $project: {
        _id: 1,
        name: 1,
        color: 1,
        duration: 1,
        tolerance: 1,
        limit: 1,
        group: 1,
        price: 1,
        image: { filename: 1, originalname: 1, s3_bucket: 1 },
      },
    },
  ];

  let query_product_data = await req.db_connection.models.product
    .aggregate(query_group_aggregation)
    .exec();
  query_product_data = is_an_empty_object(query_product_data[0])
    ? null
    : query_product_data[0];

  if (query_product_data) {
    await update_and_get_system_product_image_file_url(
      req.db_connection,
      req._auth,
      [query_product_data]
    );
  }

  return { _data: query_product_data };
};
