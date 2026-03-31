import { TModule } from "@app_root/core/types";
import controllers from "./controllers";

const auth_module: TModule = { routePath: "/auth", controllers };

export { auth_module };
