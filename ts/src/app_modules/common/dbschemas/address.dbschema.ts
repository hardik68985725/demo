import { Schema } from "mongoose";

const dbschema_address = new Schema(
  {
    line_1: { type: String, trim: true, default: undefined },
    line_2: { type: String, trim: true, default: undefined },
    city: { type: String, trim: true, default: undefined },
    zip_code: { type: String, trim: true, default: undefined },
    state: { type: String, trim: true, default: undefined },
    country: { type: String, trim: true, default: undefined }
  },
  {
    _id: false,
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false }
  }
);

export { dbschema_address };
