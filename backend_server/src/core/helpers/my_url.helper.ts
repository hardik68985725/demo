import { URL } from "node:url";
import { Request } from "express";

const getSubdomain = (req: Request) => {
  const origin = req.get("origin")?.trim();
  if (!origin || !isValidUrl(origin)) return "";
  const splittedHostname = new URL(origin).hostname.split(".");
  return splittedHostname.length > 2 ? splittedHostname[0] : "";
};

const isValidUrl = (value: string): boolean => {
  try {
    return !!new URL(value?.trim()).hostname;
  } catch {
    return false;
  }
};

const isAValidSubdomain = (value: string) =>
  /^[a-z0-9](?:[a-z0-9-]{0,13}[a-z0-9])?$/.test(value?.trim());

export { getSubdomain, isValidUrl, isAValidSubdomain };
