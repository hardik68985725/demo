import { TModule } from "@app_root/core/types";
import { default as controllers } from "./controllers";
import { default as dbschemas } from "./dbschemas";

const role_module: TModule = {
  is_disabled: false,
  route_path: "/role",
  controllers,
  dbschemas
};

export { role_module };
