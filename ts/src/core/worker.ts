import { join } from "node:path";

// APP_MODULES DIRECTORY ALIASING. MOST IMPORTANT.
import { addAlias } from "module-alias";
addAlias("@app_root", join(__dirname, ".."));
// /APP_MODULES DIRECTORY ALIASING. MOST IMPORTANT.

// SET ENVIRONMENT VARIABLES
import "./env.var";
// /SET ENVIRONMENT VARIABLES

// SET GLOBAL VARIABLES
import "./globals/global.var";
// /SET GLOBAL VARIABLES

// OVERWRITE JAVASCRIPT'S EXITING FUNCTIONS
import "./configs/js_overwrite.config";
// /OVERWRITE JAVASCRIPT'S EXITING FUNCTIONS

import http from "node:http";
import express from "express";
import logger from "morgan";
import cors from "cors";
import helmet from "helmet";
import useragent from "express-useragent";
import compression from "compression";

// IMPORT ROUTER MIDDLEWARE FILE
import { AppRouter } from "./app_router";
// /IMPORT ROUTER MIDDLEWARE FILE

const app = express();

app.set("port", process.env.PORT);

app.use(logger("dev", { skip: (req) => req.url === "/ok" }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(useragent.express());

// ROUTER MIDDLEWARE
app.use(AppRouter);
// /ROUTER MIDDLEWARE

// SETUP HTTP SERVER
http
  .createServer(app)
  .on("error", (_server_error: unknown) => {
    console.my_log_point("_server_error", _server_error);
  })
  .on("listening", () => {
    console.my_log_point(
      `SERVER IS RUNNING ON PORT ${app.get("port")}. [${process.pid}]`
    );
  })
  .listen(app.get("port"));
// /SETUP HTTP SERVER
