const { service_timezone } = require("./timezone.service");
const { service_subdomain } = require("./subdomain.service");
const { service_media } = require("./media.service");

const config = Object.freeze({});

module.exports.service_common = {
  config,
  service_timezone,
  service_subdomain,
  service_media,
};
