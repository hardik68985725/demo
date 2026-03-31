import { TModule } from "@app_root/core/types";
import controllers from "./controllers";

const user_module: TModule = { routePath: "/user", controllers };

export { user_module };
