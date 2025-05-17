import { TModule } from "@app_root/core/types";
import { default as controllers } from "./controllers";
import { default as dbschemas } from "./dbschemas";

const organization_module: TModule = {
  is_disabled: false,
  route_path: "/organization",
  controllers,
  dbschemas
};

export { organization_module };
