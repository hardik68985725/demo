import { join } from "node:path";
import { myLogger } from "@app_root/core/helpers/my_logger.helper";

Object.defineProperty(global, "__root_path__", {
  value: join(__dirname, "../..").replaceAll("\\", "/"),
  writable: false,
  configurable: false
});

Object.defineProperty(global, "__line__", {
  // EXAMPLE TO USE: __line__;
  get: function () {
    const error: any = new Error();
    const regex = /\((.*):(\d+):(\d+)\)$/;
    const match: any = regex.exec(error.stack.split("\n")[2]);
    myLogger.log(`At ${match[1]} on line ${match[2]}.`);
    return undefined;
  },
  configurable: false
});

Object.defineProperty(global, "myLogger", {
  value: myLogger,
  writable: false,
  configurable: false
});
