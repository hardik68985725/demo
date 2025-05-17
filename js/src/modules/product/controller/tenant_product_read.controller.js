const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");
const {
  joischema_tenant_product_read,
} = require("../joischema/tenant_product_read.joischema");
const {
  my_type: { get_boolean, is_an_empty_object },
  utility: { escape_regexp, get_pagination_pipeline },
} = require("../../../helpers/helpers.index");
const {
  service_product: { update_and_get_tenant_product_image_file_url },
} = require("../service/product.service");

// -----------------------------------------------------------------------------

module.exports.method = "get";
module.exports.route_path = "/tenant/:tenant";
module.exports.controller = async (req) => {
  const { body_data, validation_errors } = await joischema_tenant_product_read({
    ...req.query,
    ...req.params,
  });
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
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

  const _match_status = {};
  if (body_data.status) {
    _match_status.status = body_data.status;
  }

  req.query.is_for_autocomplete = get_boolean(req.query.is_for_autocomplete);

  const _project_final_pipeline = [];
  if (!req.query.is_for_autocomplete) {
    _project_final_pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        duration: 1,
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
  if (!req.query.is_for_autocomplete) {
    _lookup_pipeline_group.push(
      {
        $lookup: {
          as: "group",
          from: "groups",
          localField: "group",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $unwind: "$group" }
    );
  }

  const query_product_aggregation = [
    { $match: _match_search },

    { $match: _match_status },

    ..._lookup_pipeline_group,

    ..._project_final_pipeline,

    ...pagination_pipeline,
  ];

  // CREATE TENANT DB CONNECTION.
  const tenant_db_connection = await connect_to_db(
    process.env.TENANT_DB_NAME_PREFIX.concat(body_data.tenant)
  );
  // /CREATE TENANT DB CONNECTION.

  let query_product_data = await tenant_db_connection.models.product
    .aggregate(query_product_aggregation)
    .exec();
  query_product_data = is_an_empty_object(query_product_data[0])
    ? null
    : query_product_data[0];

  if (!req.query.is_for_autocomplete) {
    if (query_product_data) {
      await update_and_get_tenant_product_image_file_url(
        tenant_db_connection,
        req._auth,
        query_product_data.product_list,
        body_data.tenant
      );
    }
  }
  await tenant_db_connection.close();

  return { _data: query_product_data };
};
