const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");

const dbschema_auth = new Schema(
  {
    token: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    created_by: {
      type: ObjectId,
      ref: "user",
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false },
  }
);

module.exports = {
  model_name: "auth",
  dbschema: dbschema_auth,
  is_for_master_db: true,
};
