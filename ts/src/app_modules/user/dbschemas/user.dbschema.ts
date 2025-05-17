import { Schema, Types } from "mongoose";
import { UserEnums } from "@app_root/app_modules/user/enums";
import { dbschema_address } from "@app_root/app_modules/common/dbschemas/address.dbschema";

const EGendersValues = Object.values(UserEnums.EGenders) as Array<string>;

const dbschema_user = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
      lowercase: true
    },
    password: { type: String, trim: true, default: undefined },
    set_password_token: {
      type: {
        _id: false,
        created_at: { type: Date, require: true },
        token: { type: String, trim: true, required: true }
      },
      default: undefined
    },
    organization: {
      type: Types.ObjectId,
      ref: "organization",
      default: undefined
    },
    is_owner: { type: Boolean, default: undefined },
    role: { type: Types.ObjectId, ref: "role", default: undefined },
    mobile_phone_number: { type: String, trim: true, default: undefined },
    name: {
      type: {
        _id: false,
        first: { type: String, trim: true, required: true },
        last: { type: String, trim: true, default: undefined }
      },
      default: undefined
    },
    birth_date: { type: Date, default: undefined },
    gender: {
      type: String,
      trim: true,
      enum: EGendersValues,
      lowercase: true,
      default: undefined
    },
    address: { type: dbschema_address, default: undefined },
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

export default { model_name: "user", schema: dbschema_user };
