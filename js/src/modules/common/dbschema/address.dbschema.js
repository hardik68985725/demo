const { Schema } = require("mongoose");

const dbschema_address = new Schema(
  {
    _id: false,
    line_1: {
      type: String,
      trim: true,
      default: undefined,
    },
    line_2: {
      type: String,
      trim: true,
      default: undefined,
    },
    city: {
      type: String,
      trim: true,
      default: undefined,
    },
    zip_code: {
      type: String,
      trim: true,
      default: undefined,
    },
    state: {
      type: String,
      trim: true,
      default: undefined,
    },
    country: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false },
  }
);

module.exports = {
  dbschema: dbschema_address,
  is_for_master_db: true,
};
