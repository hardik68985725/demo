import { Schema, Types } from "mongoose";
import { RoleEnums } from "@app_root/app_modules/role/enums";

const EPermissionNamesValues = Object.values(
  RoleEnums.EPermissionNames
) as Array<string>;

const dbschema_role = new Schema(
  {
    name: { type: String, trim: true, required: true },
    have_rights: {
      type: {
        _id: false,
        organization: {
          type: String,
          default: undefined,
          enum: EPermissionNamesValues
        },
        product: {
          type: String,
          default: undefined,
          enum: EPermissionNamesValues
        },
        location: {
          type: String,
          default: undefined,
          enum: EPermissionNamesValues
        }
      },
      default: undefined
    },
    organization: {
      type: Types.ObjectId,
      ref: "organization",
      default: undefined
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

export default { model_name: "role", schema: dbschema_role };
