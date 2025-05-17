import { TController } from "./";
import { TDbSchema } from "./";

export type TModule = {
  is_disabled: boolean;
  route_path: string;
  controllers: Array<TController>;
  dbschemas: Array<TDbSchema>;
};
