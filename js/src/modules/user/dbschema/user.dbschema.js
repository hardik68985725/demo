const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const {
  service_user: {
    config: { enum_gender },
  },
} = require("../service/user.service");
const {
  dbschema: dbschema_address,
} = require("../../common/dbschema/address.dbschema");

// -----------------------------------------------------------------------------

const dbschema_user = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      default: undefined,
    },
    set_password_token: {
      type: {
        _id: false,
        created_at: { type: Date, require: true },
        token: { type: String, trim: true, required: true },
      },
      default: undefined,
    },
    is_owner: {
      type: Boolean,
      default: undefined,
    },
    role: {
      type: ObjectId,
      ref: "role",
      default: undefined,
    },
    mobile_phone_number: {
      type: String,
      trim: true,
      default: undefined,
    },
    name: {
      type: {
        _id: false,
        first: { type: String, trim: true, required: true },
        last: { type: String, trim: true, default: undefined },
      },
      default: undefined,
    },
    birth_date: {
      type: Date,
      default: undefined,
    },
    gender: {
      type: String,
      trim: true,
      default: undefined,
      enum: enum_gender,
    },
    address: {
      type: dbschema_address,
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
  model_name: "user",
  dbschema: dbschema_user,
  is_for_master_db: true,
};
