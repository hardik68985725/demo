const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const {
  service_product: {
    config: { enum_product_status },
  },
} = require("../service/product.service");
const dbschema_product = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    color: {
      type: String,
      trim: true,
      default: "#" + Math.random().toString(16).slice(-6),
    },
    duration: {
      type: Number,
      required: true,
    },
    tolerance: {
      type: Number,
      required: true,
    },
    limit: {
      _id: false,
      quarantine: {
        type: Number,
        default: 0,
      },
    },
    group: {
      type: ObjectId,
      ref: "group",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: {
        _id: false,
        filename: { type: String, trim: true, required: true }, // THIS IS VERY IMPORTANT. IT IS KEY FOR THE S3 BUCKET.
        originalname: { type: String, trim: true, required: true },
        encoding: { type: String, trim: true, required: true },
        mimetype: { type: String, trim: true, required: true },
        size: { type: String, trim: true, required: true },
        s3_bucket: {
          type: {
            _id: false,
            created_at: { type: Date, require: true },
            url: { type: String, trim: true, require: true },
          },
          default: undefined,
        },
      },
      required: true,
    },
    created_by: {
      type: ObjectId,
      ref: "user",
      required: true,
      immutable: true,
    },
    updated_by: {
      type: ObjectId,
      ref: "user",
      default: undefined,
    },
    status: {
      type: String,
      trim: true,
      default: "pending",
      enum: enum_product_status,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false },
  }
);

module.exports = {
  model_name: "product",
  dbschema: dbschema_product,
  is_for_tenant_db: true,
};
