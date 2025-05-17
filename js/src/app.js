// IMPORT PROTOTYPES
require("./prototypes/index.prototype");
// /IMPORT PROTOTYPES

// SET ENVIRONMENT VARIABLES
require("./env.var");
// /SET ENVIRONMENT VARIABLES

// SET GLOBAL VARIABLES
require("./global.var");
// /SET GLOBAL VARIABLES

const http = require("node:http");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

// IMPORT ROUTER MIDDLEWARE FILE
const { Router } = require("./router/router.index");
// /IMPORT ROUTER MIDDLEWARE FILE

const app = express();

app.set("port", process.env.PORT);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

// ROUTER MIDDLEWARE
app.use(Router);
// /ROUTER MIDDLEWARE

http
  .createServer(app)
  .on("error", (_server_error) => {
    console.log(">>>>> _server_error >", _server_error);
  })
  .on("listening", () => {
    console.log(
      `>>>>> server is running on port ${app.get("port")}. [${process.pid}]`
    );
  })
  .listen(app.get("port"));
