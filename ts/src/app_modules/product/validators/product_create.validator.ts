import { Request } from "express";
import Joi from "joi";
import { my_joi } from "@app_root/core/helpers";

export const product_create_validator = (req: Request) => {
  req.app_data.validation_data.input_data = { ...req.body };

  return Joi.object({
    name: Joi.string()
      .trim()
      .empty("")
      .required()
      .insensitive()
      .label("Product name"),
    color: Joi.string()
      .trim()
      .empty("")
      .required()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .messages({
        "string.pattern.base":
          "{#label} is invalid. It must be a HEX. color code. Like, #123ABC."
      })
      .label("Color code"),
    duration: Joi.alternatives()
      .try(
        Joi.number(),
        Joi.string()
          .trim()
          .empty("")
          .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$"))
      )
      .required()
      .messages({
        "alternatives.match":
          "{#label} is invalid. It must be a number or a string representing a number."
      })
      .label("Duration"),
    tolerance: Joi.alternatives()
      .try(
        Joi.number(),
        Joi.string()
          .trim()
          .empty("")
          .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$"))
      )
      .required()
      .messages({
        "alternatives.match":
          "{#label} is invalid. It must be a number or a string representing a number."
      })
      .label("Tolerance"),
    quarantine: Joi.alternatives()
      .try(
        Joi.number(),
        Joi.string()
          .trim()
          .empty("")
          .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$"))
      )
      .required()
      .messages({
        "alternatives.match":
          "{#label} is invalid. It must be a number or a string representing a number."
      })
      .label("Quarantine Limit"),
    group: Joi.string()
      .trim()
      .empty("")
      .required()
      .custom(my_joi.custom_is_mongodb_objectid)
      .label("Group"),
    price: Joi.string()
      .trim()
      .empty("")
      .pattern(new RegExp("^[+-]?([0-9]*[.])?[0-9]+$")) // NUMBER PATTERN WITH DECIMAL POINT. EX.: 55.55 IS VALID, 5S.55 IS INVALID.
      .messages({
        "string.pattern.base": "{#label} is invalid. It must be a number."
      })
      .label("Price")
  });
};
