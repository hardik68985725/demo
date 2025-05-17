const { mw_role } = require("../../../middlewares/middlewares.index");
const {
  utility: { get_pagination_pipeline, escape_regexp },
  my_type: { get_boolean, is_an_empty_object },
} = require("../../../helpers/helpers.index");
const {
  service_role: { check_role },
} = require("../../role/service/role.service");
const {
  service_product: { update_and_get_system_product_image_file_url },
} = require("../service/product.service");

// -----------------------------------------------------------------------------

module.exports.method = "get";
module.exports.route_path = "/";
module.exports.middlewares = [mw_role("product", "read", true)];
module.exports.controller = async (req) => {
  req.query.is_for_autocomplete = get_boolean(req.query.is_for_autocomplete);
  if (!req.query.is_for_autocomplete) {
    check_role(req);
  }

  const pagination_pipeline = get_pagination_pipeline({
    page_no: req.query.page_no,
    rows_per_page: req.query.rows_per_page,
    data_list_field_name: "product_list",
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

  const _project_final_pipeline = [];
  if (!req.query.is_for_autocomplete) {
    _project_final_pipeline.push({
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
    });
  } else {
    _project_final_pipeline.push({ $project: { _id: 1, name: 1 } });
  }

  const _lookup_pipeline_group = [];
  if (!req.body.is_for_autocomplete) {
    _lookup_pipeline_group.push(
      {
        $lookup: {
          as: "lookup_group",
          from: "groups",
          let: { v_group_id: { $toObjectId: "$group" } },
          pipeline: [
            {
              $match: { $expr: { $and: [{ $eq: ["$$v_group_id", "$_id"] }] } },
            },
            { $project: { _id: 1, name: 1, duration: 1, limit: 1 } },
          ],
        },
      },
      {
        $addFields: { group: { $first: "$lookup_group" } },
      }
    );
  }

  const query_product_aggregation = [
    { $match: _match_search },

    ..._lookup_pipeline_group,

    ..._project_final_pipeline,

    ...pagination_pipeline,
  ];

  let query_product_data = await req.db_connection.models.product
    .aggregate(query_product_aggregation)
    .exec();
  query_product_data = is_an_empty_object(query_product_data[0])
    ? null
    : query_product_data[0];

  if (!req.body.is_for_autocomplete) {
    if (query_product_data) {
      await update_and_get_system_product_image_file_url(
        req.db_connection,
        req._auth,
        query_product_data.product_list
      );
    }
  }

  return { _data: query_product_data };
};
