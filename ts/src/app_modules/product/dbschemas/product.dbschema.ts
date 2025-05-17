import { Schema, Types } from "mongoose";
import { ProductEnums } from "@app_root/app_modules/product/enums";

const EProductStatusValues = Object.values(
  ProductEnums.EStatus
) as Array<string>;

const dbschema_product = new Schema(
  {
    organization: {
      type: Types.ObjectId,
      ref: "organization",
      default: undefined
    },
    status: {
      type: String,
      default: ProductEnums.EStatus.Pending,
      enum: EProductStatusValues
    },
    group: { type: Types.ObjectId, ref: "group", required: true },
    name: { type: String, trim: true, required: true },
    price: { type: Number, default: 0 },
    color: {
      type: String,
      trim: true,
      default: `#${Math.random().toString(16).slice(-6)}`
    },
    quarantine: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    tolerance: { type: Number, default: 0 },
    image: {
      type: {
        _id: false,
        filename: { type: String, trim: true, required: true }, // THIS IS VERY IMPORTANT. IT IS KEY FOR THE S3 BUCKET.
        originalname: { type: String, trim: true, required: true },
        mimetype: { type: String, trim: true, required: true },
        size: { type: String, trim: true, required: true },
        s3_bucket: {
          type: {
            _id: false,
            created_at: { type: Date, require: true },
            url: { type: String, trim: true, require: true }
          },
          default: undefined
        }
      },
      required: true
    },
    created_by: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
      immutable: true
    },
    updated_by: { type: Types.ObjectId, ref: "user", default: undefined }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false }
  }
);

export default { model_name: "product", schema: dbschema_product };
