import { TModule } from "@app_root/core/types";
import { default as controllers } from "./controllers";
import { default as dbschemas } from "./dbschemas";

const user_module: TModule = {
  is_disabled: false,
  route_path: "/user",
  controllers,
  dbschemas
};

export { user_module };
