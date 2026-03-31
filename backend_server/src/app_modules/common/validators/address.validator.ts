import { my_joi } from "@app_root/core/helpers";

export const addressValidator = my_joi.Joi.object({
  line_1: my_joi.Joi.string().required().label("Address line 1"),
  line_2: my_joi.Joi.string().required().label("Address line 2"),
  city: my_joi.Joi.string().required().label("City"),
  zip_code: my_joi.Joi.string().required().label("Zip code"),
  state: my_joi.Joi.string().required().label("State"),
  country: my_joi.Joi.string().required().label("Country")
}).label("Address");
