const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");
const {
  service_tenant: {
    service_role: {
      config: { enum_permission_names },
    },
  },
} = require("../service/tenant.service");

const dbschema_role = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    have_rights: {
      type: {
        _id: false,
        product: {
          type: [String],
          default: undefined,
          enum: enum_permission_names,
        },
        location: {
          type: [String],
          default: undefined,
          enum: enum_permission_names,
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
  model_name: "role",
  dbschema: dbschema_role,
  is_for_tenant_db: true,
};
