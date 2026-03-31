import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";
import { RoleEnums } from "@app_root/app_modules/role/enums";

export const role_create_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.body };

  return my_joi.Joi.object({
    name: my_joi.Joi.string().required().insensitive().label("Role name"),
    have_rights: my_joi.Joi.object({
      user: my_joi.Joi.string()
        .insensitive()
        .enum(
          Object.values(RoleEnums.EPermissionNames),
          Object.keys(RoleEnums.EPermissionNames)
        )
        .default(RoleEnums.EPermissionNames.Inactive)
        .label("User permission"),
      role: my_joi.Joi.string()
        .insensitive()
        .enum(
          Object.values(RoleEnums.EPermissionNames),
          Object.keys(RoleEnums.EPermissionNames)
        )
        .default(RoleEnums.EPermissionNames.Inactive)
        .label("Role permission")
    }).label("Have rights")
  });
};
