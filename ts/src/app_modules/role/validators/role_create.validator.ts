import { Request } from "express";
import Joi from "joi";
import { RoleEnums } from "@app_root/app_modules/role/enums";

export const role_create_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  const EPermissionNamesKeys = (
    Object.keys(RoleEnums.EPermissionNames) as Array<string>
  ).join();
  const EPermissionNamesValues = Object.values(
    RoleEnums.EPermissionNames
  ) as Array<string>;

  return Joi.object({
    name: Joi.string()
      .trim()
      .empty("")
      .required()
      .insensitive()
      .label("Role name"),
    have_rights: Joi.object({
      organization: Joi.string()
        .trim()
        .empty("")
        .valid(...EPermissionNamesValues)
        .insensitive()
        .default(RoleEnums.EPermissionNames.Inactive)
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${EPermissionNamesKeys}.`
        })
        .label("Organization permission"),
      device: Joi.string()
        .trim()
        .empty("")
        .valid(...EPermissionNamesValues)
        .insensitive()
        .default(RoleEnums.EPermissionNames.Inactive)
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${EPermissionNamesKeys}.`
        })
        .label("Device permission"),
      product: Joi.string()
        .trim()
        .empty("")
        .valid(...EPermissionNamesValues)
        .insensitive()
        .default(RoleEnums.EPermissionNames.Inactive)
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${EPermissionNamesKeys}.`
        })
        .label("Product permission"),
      location: Joi.string()
        .trim()
        .empty("")
        .valid(...EPermissionNamesValues)
        .insensitive()
        .default(RoleEnums.EPermissionNames.Inactive)
        .messages({
          "any.only": `{#label} is invalid. Value must be among ${EPermissionNamesKeys}.`
        })
        .label("Location permission")
    }).label("Have rights")
  });
};
