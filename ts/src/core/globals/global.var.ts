import { join } from "node:path";

global.__root_path__ = join(__dirname, "../..").replaceAll("\\", "/");

Object.defineProperty(global, "__line__", {
  // EXAMPLE TO USE: __line__;
  get: function () {
    const error: any = new Error();
    const regex = /\((.*):(\d+):(\d+)\)$/;
    const match: any = regex.exec(error.stack.split("\n")[2]);
    console.my_log_point(`At ${match[1]} on line ${match[2]}.`);
    return undefined;
  }
});
