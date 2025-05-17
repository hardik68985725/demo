const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const {
  dbschema: dbschema_address,
} = require("../../common/dbschema/address.dbschema");
const {
  service_common: {
    service_timezone: {
      config: { enum_timezone },
    },
  },
} = require("../../common/service/common.service");

const dbschema_tenant = new Schema(
  {
    subdomain: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: dbschema_address,
      required: true,
    },
    business_day: {
      type: {
        _id: false,
        sunday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
        monday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
        tuesday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
        wednesday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
        thursday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
        friday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
        saturday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" },
          },
        },
      },
      required: true,
    },
    timezone: {
      type: String,
      trim: true,
      default: "UTC",
      enum: enum_timezone,
    },
    mqtt_topic: {
      type: String,
      trim: true,
      required: true,
    },
    blukii_hub_id: {
      type: String,
      trim: true,
      default: undefined,
    },
    currency: {
      type: String,
      trim: true,
      required: true,
    },
    tenant_owner: {
      type: ObjectId,
      ref: "user",
      default: undefined,
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
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false },
  }
);

module.exports = {
  model_name: "tenant",
  dbschema: dbschema_tenant,
  is_for_master_db: true,
};
