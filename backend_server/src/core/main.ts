import { join } from "node:path";

// APP_MODULES DIRECTORY ALIASING. MOST IMPORTANT.
import { addAlias } from "module-alias";
addAlias("@app_root", join(__dirname, ".."));
// /APP_MODULES DIRECTORY ALIASING. MOST IMPORTANT.

// SET GLOBAL VARIABLES
// import "./globals/global.var";
import "@app_root/core/globals/global.var";
// /SET GLOBAL VARIABLES

// SET ENVIRONMENT VARIABLES
// import "./env.var";
import "@app_root/core/env.var";
// /SET ENVIRONMENT VARIABLES

import http from "node:http";
import express from "express";
import logger from "morgan";
import cors from "cors";
import helmet from "helmet";
import useragent from "express-useragent";
import compression from "compression";

// IMPORT ROUTER MIDDLEWARE FILE
import { AppRouter } from "@app_root/core/app_router";
// /IMPORT ROUTER MIDDLEWARE FILE

const app = express();

app.set("port", process.env.PORT);

app.use(logger("dev", { skip: (req) => ["/", "/ok"].includes(req.url) }));
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
  .on("error", (serverError: unknown) => {
    myLogger.error("serverError", serverError);
  })
  .on("listening", () => {
    myLogger.log(
      `SERVER IS RUNNING ON PORT ${app.get("port")}. [${process.pid}]`
    );
  })
  .listen(app.get("port"));
// /SETUP HTTP SERVER
