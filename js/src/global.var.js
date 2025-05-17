const path = require("node:path");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment").utc;

global.__root_path = path.join(__dirname, "/").replaceAll("\\", "/"); // PROJECT'S DIRECTORY PATH (./)
global.__uuidv4 = uuidv4;
global.__moment = moment;
