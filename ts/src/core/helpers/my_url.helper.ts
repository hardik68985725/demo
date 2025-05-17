import { Request } from "express";
import { URL } from "url";

const get_subdomain = (_req: Request) => {
  if (!_req) {
    return "";
  }

  if (!is_valid_url(_req.get("origin") || "")) {
    return "";
  }

  const _url = new URL(_req.get("origin") || "");
  if (_url.hostname.indexOf(".") > 0) {
    const splitted_hostname = _url.hostname.split(".");
    if (splitted_hostname.length > 1) {
      return splitted_hostname[0];
    }
  }

  return "";
};

const is_valid_url = (_value: string) => {
  try {
    new URL(_value?.toString()?.trim());
    return true;
  } catch (_error) {
    return false;
  }
};

const is_a_valid_subdomain = (_value: string) =>
  new RegExp("^[a-z][a-z0-9]{2,14}$").test(_value?.toString()?.trim());

export { get_subdomain, is_valid_url, is_a_valid_subdomain };
