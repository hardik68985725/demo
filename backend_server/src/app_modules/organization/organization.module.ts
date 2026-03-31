import { TModule } from "@app_root/core/types";
import controllers from "./controllers";

const organization_module: TModule = {
  routePath: "/organization",
  controllers
};

export { organization_module };
