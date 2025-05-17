import { Schema, Types } from "mongoose";

const dbschema_auth = new Schema(
  {
    token: { type: String, trim: true, required: true, immutable: true },
    maca: { type: String, trim: true, default: undefined, immutable: true },
    useragent: {
      type: String,
      trim: true,
      default: undefined,
      immutable: true
    },
    created_by: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
      immutable: true
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false }
  }
);

export default { model_name: "auth", schema: dbschema_auth };
