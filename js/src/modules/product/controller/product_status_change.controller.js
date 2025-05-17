const {
  service_product: { tenant_product_status_change },
} = require("../service/product.service");

module.exports.method = "patch";
module.exports.route_path = "/:tenant/status";
module.exports.controller = async (req) => {
  return await tenant_product_status_change(req);
};
