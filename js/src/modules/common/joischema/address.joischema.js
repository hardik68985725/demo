const Joi = require("joi");

module.exports.joischema_address = Joi.object({
  line_1: Joi.string().trim().empty("").required().label("Address line 1"),
  line_2: Joi.string().trim().empty("").required().label("Address line 2"),
  city: Joi.string().trim().empty("").required().label("City"),
  zip_code: Joi.string().trim().empty("").required().label("Zip code"),
  state: Joi.string().trim().empty("").required().label("State"),
  country: Joi.string().trim().empty("").required().label("Country"),
}).label("Address");
