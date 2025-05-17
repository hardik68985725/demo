import { Schema, Types } from "mongoose";
import { dbschema_address } from "@app_root/app_modules/common/dbschemas/address.dbschema";
import { OrganizationEnums } from "@app_root/app_modules/organization/enums";

const ETimezonesValues = Object.values(
  OrganizationEnums.ETimezones
) as Array<string>;

const dbschema_organization = new Schema(
  {
    subdomain: { type: String, trim: true, required: true, lowercase: true },
    name: { type: String, trim: true, required: true },
    address: { type: dbschema_address, required: true },
    business_day: {
      type: {
        _id: false,
        sunday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        },
        monday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        },
        tuesday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        },
        wednesday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        },
        thursday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        },
        friday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        },
        saturday: {
          _id: false,
          type: {
            _id: false,
            start_at: { type: String, trim: true, default: "00:00" },
            end_at: { type: String, trim: true, default: "23:59" }
          }
        }
      },
      required: true
    },
    timezone: {
      type: String,
      trim: true,
      default: OrganizationEnums.ETimezones.UTC,
      enum: ETimezonesValues
    },
    currency: { type: String, trim: true, required: true },
    owner: { type: Types.ObjectId, ref: "user", default: undefined },
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

export default { model_name: "organization", schema: dbschema_organization };
