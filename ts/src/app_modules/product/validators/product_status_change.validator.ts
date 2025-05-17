import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";
import { ProductEnums } from "@app_root/app_modules/product/enums";

export const product_status_change_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body, ...req.params };

  const EProductStatusKeys = (
    Object.keys(ProductEnums.EStatus) as Array<string>
  ).join();
  const EProductStatusValues = Object.values(
    ProductEnums.EStatus
  ) as Array<string>;

  return Joi.object({
    organization: Joi.string()
      .trim()
      .empty("")
      .required()
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Organization id"),
    status: Joi.string()
      .trim()
      .empty("")
      .required()
      .insensitive()
      .valid(...EProductStatusValues)
      .default(ProductEnums.EStatus.Pending)
      .messages({
        "any.only": `{#label} is invalid. Value must be among ${EProductStatusKeys}.`
      })
      .label("Product Status"),
    products: Joi.array()
      .items(
        Joi.string().trim().empty("").custom(my_joi.custom_is_mongodb_objectid)
      )
      .required()
      .messages({
        "any.invalid": `Product id {#value} is invalid.`,
        "array.sparse": `{#label} is invalid. No blank value allowed.`
      })
      .label("Product ids")
  });
};
