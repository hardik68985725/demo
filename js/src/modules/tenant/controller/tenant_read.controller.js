const { mw_role } = require("../../../middlewares/middlewares.index");
const {
  utility: { get_pagination_pipeline, escape_regexp },
  my_type: { get_boolean, is_an_empty_object },
} = require("../../../helpers/helpers.index");
const {
  service_role: { check_role },
} = require("../../role/service/role.service");

// -----------------------------------------------------------------------------

module.exports.method = "get";
module.exports.route_path = "/";
module.exports.middlewares = [mw_role("tenant", "read", true)];
module.exports.controller = async (req) => {
  req.query.is_for_autocomplete = get_boolean(req.query.is_for_autocomplete);
  if (!req.query.is_for_autocomplete) {
    check_role(req);
  }

  const pagination_pipeline = get_pagination_pipeline({
    page_no: req.query.page_no,
    rows_per_page: req.query.rows_per_page,
    data_list_field_name: "tenant_list",
  });

  const _project_final_pipeline = [];
  if (!req.query.is_for_autocomplete) {
    _project_final_pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        subdomain: 1,
        address: 1,
        business_day: 1,
        timezone: 1,
        mqtt_topic: 1,
        blukii_hub_id: 1,
        currency: 1,
      },
    });
  } else {
    _project_final_pipeline.push({
      $project: { _id: 1, name: 1, subdomain: 1 },
    });
  }

  const _match = {};
  if (!req._auth.is_system_owner) {
    _match.created_by = req._auth.created_by;
  }

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
      {
        subdomain: {
          $regex: new RegExp(escape_regexp(req.query.search_text.trim()))
            .toString()
            .replaceAll("/", ""),
          $options: "i",
        },
      },
    ];
  }

  const query_tenant_aggregation = [
    { $match: _match },

    { $match: _match_search },

    ..._project_final_pipeline,

    ...pagination_pipeline,
  ];

  let query_tenant_data = await req.db_connection.models.tenant
    .aggregate(query_tenant_aggregation)
    .exec();
  query_tenant_data = is_an_empty_object(query_tenant_data[0])
    ? null
    : query_tenant_data[0];

  return { _data: query_tenant_data };
};
