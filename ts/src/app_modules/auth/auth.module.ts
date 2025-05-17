import { TModule } from "@app_root/core/types";
import { default as controllers } from "./controllers";
import { default as dbschemas } from "./dbschemas";

const auth_module: TModule = {
  is_disabled: false,
  route_path: "/auth",
  controllers,
  dbschemas
};

export { auth_module };
