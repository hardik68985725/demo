const { URL } = require("url");

const is_valid_url = (_value) => {
  try {
    new URL(_value);
    return true;
  } catch (_error) {
    return false;
  }
};

const get_subdomain = (_req) => {
  if (!_req) {
    return;
  }

  /* if (!is_valid_url(`${_req.protocol}://${_req.hostname}`)) {
    return;
  } */

  if (!is_valid_url(_req.get("origin"))) {
    return;
  }

  const _url = new URL(_req.get("origin"));
  if (_url.hostname.indexOf(".") > 0) {
    const splitted_hostname = _url.hostname.split(".");
    if (splitted_hostname.length > 1) {
      return splitted_hostname[0];
    }
  }

  return;
};

const is_a_valid_subdomain = (_value) =>
  new RegExp("^[a-z][a-z0-9]{2,14}$").test(_value?.toString()?.trim());

module.exports.my_url = {
  is_valid_url,
  get_subdomain,
  is_a_valid_subdomain,
};
