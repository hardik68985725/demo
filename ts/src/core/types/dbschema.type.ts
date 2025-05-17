import { Schema } from "mongoose";

export type TDbSchema = {
  model_name: string;
  schema: Schema;
};
