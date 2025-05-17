const { tenant_product_create } = require("./tenant_product_create.service");
const {
  tenant_product_status_change,
} = require("./tenant_product_status.service");
const {
  update_and_get_system_product_image_file_url,
  update_and_get_tenant_product_image_file_url,
} = require("./product_image_file_url.service");

const config = Object.freeze({ enum_product_status: ["pending", "approved"] });

module.exports.service_product = {
  config,
  tenant_product_create,
  tenant_product_status_change,
  update_and_get_system_product_image_file_url,
  update_and_get_tenant_product_image_file_url,
};
