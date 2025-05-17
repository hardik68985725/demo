import { Schema } from "mongoose";
import { DummycrudEnums } from "@app_root/app_modules/dummycrud/enums";

const EDummycrudsValues = Object.values(
  DummycrudEnums.EDummycruds
) as Array<string>;

const dbschema_dummycrud = new Schema(
  {
    dummycrud: {
      type: String,
      default: DummycrudEnums.EDummycruds.Dummycrud,
      enum: EDummycrudsValues
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toObject: { virtuals: false },
    toJSON: { virtuals: false }
  }
);

export default { model_name: "dummycrud", schema: dbschema_dummycrud };
