import { TModule } from "@app_root/core/types";
import { default as controllers } from "./controllers";
import { default as dbschemas } from "./dbschemas";

const product_module: TModule = {
  is_disabled: false,
  route_path: "/product",
  controllers,
  dbschemas
};

export { product_module };
