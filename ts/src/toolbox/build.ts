import { existsSync } from "node:fs";
import { cd, exec, cp, rm } from "shelljs";

if (existsSync("../dist")) {
  cd("../dist");
  cp("-R", ["../src/package.json", "../src/package-lock.json"], "./");
  cp("-R", ["../src/views"], "./views");
  exec("npm install --omit=dev");
  rm("-R", ["./package.json", "./package-lock.json"]);
}
