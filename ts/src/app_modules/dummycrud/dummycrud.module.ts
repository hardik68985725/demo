import { TModule } from "@app_root/core/types";
import { default as controllers } from "./controllers";
import { default as dbschemas } from "./dbschemas";

const dummycrud_module: TModule = {
  is_disabled: false,
  route_path: "/dummycrud",
  controllers,
  dbschemas
};

export { dummycrud_module };
