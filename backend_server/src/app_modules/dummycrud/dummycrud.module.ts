import { TModule } from "@app_root/core/types";
import controllers from "./controllers";

const dummycrud_module: TModule = { routePath: "/dummycrud", controllers };

export { dummycrud_module };
