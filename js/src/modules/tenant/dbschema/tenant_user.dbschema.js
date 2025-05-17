const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const {
  service_user: {
    config: { enum_gender },
  },
} = require("../../user/service/user.service");
const {
  dbschema: dbschema_address,
} = require("../../common/dbschema/address.dbschema");

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
        first: {
          type: String,
          trim: true,
          required: true,
        },
        last: {
          type: String,
          trim: true,
          default: undefined,
        },
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
    tenant_data: {
      type: {
        _id: false,
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
      },
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
  is_for_tenant_db: true,
};
