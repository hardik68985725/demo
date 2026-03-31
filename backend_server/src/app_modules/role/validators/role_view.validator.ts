import { Request } from "express";
import { my_joi } from "@app_root/core/helpers";

export const role_view_validator = (req: Request) => {
  req.appData.validationData.inputData = { ...req.params };

  return my_joi.Joi.object({
    _id: my_joi.Joi.string()
      .required()
      .custom(my_joi.customIsMongodbObjectId)
      .label("Role id")
  });
};
