const mongoose = require("mongoose");
const {
  my_type: { get_boolean },
  my_db: { is_mongodb_objectid },
} = require("../helpers/helpers.index");

const _attach_models = async (_connection) => {
  // GET ALL AUTO LOADED MODULE DBSCHEMAS.
  const {
    module_dbschema: dbschema_list,
  } = require("../modules/modules.index");

  // LOOP THROUGH THE DBSCHEMA LIST TO BIND IT WITH RESPECTIVE DATABASE CONNECTION.
  for (let i = 0; i < dbschema_list.length; i++) {
    // CHECK WHETHER DBSCHEMA HAS NAME PROPERTY OR NOT.
    if (dbschema_list[i].name) {
      // CHECK FOR CONNECTION IS FOR MASTER DATABASE OR TENANT DATABASE OR DEVICE DATABASE.
      if (_connection.name === process.env.MASTER_DB_NAME) {
        // CHECK WHETHER DBSCHEMA IS FOR MASTER DATABASE.
        if (get_boolean(dbschema_list[i].is_for_master_db)) {
          // BIND DBSCHEMA AS MODEL INTO MASTER DATABASE.
          _connection.model(
            dbschema_list[i].model_name,
            dbschema_list[i].dbschema
          );
        }
      } else if (_connection.name === process.env.DEVICE_DB_NAME) {
        // CHECK WHETHER DBSCHEMA IS FOR DEVICE DATABASE.
        if (get_boolean(dbschema_list[i].is_for_device_db)) {
          // BIND DBSCHEMA AS MODEL INTO DEVICE DATABASE.
          _connection.model(
            dbschema_list[i].model_name,
            dbschema_list[i].dbschema
          );
        }
      } else {
        // CHECK WHETHER DBSCHEMA IS NOT FOR TENANT DATABASE.
        if (get_boolean(dbschema_list[i].is_for_tenant_db)) {
          // BIND DBSCHEMA AS MODEL INTO TENANT DATABASE.
          _connection.model(
            dbschema_list[i].model_name,
            dbschema_list[i].dbschema
          );
        }
      }
    }
  }
};

const _is_a_valid_db_name = (_db_name) => {
  if (!(_db_name && _db_name.toString().trim().length > 0)) {
    return false;
  }
  _db_name = _db_name.toString().trim();

  const _db_name_info = _db_name.split("_db_");
  if (
    !(_db_name_info && Array.isArray(_db_name_info) && _db_name_info.length > 0)
  ) {
    return false;
  }

  if (_db_name_info[0] === "tenant") {
    if (!is_mongodb_objectid(_db_name_info[1])) {
      return false;
    }
  }

  return true;
};

const connect_to_db = async (_db_name) => {
  mongoose.Promise = Promise;

  try {
    // CHANGE DB NAME BASED ON THE REQUEST FOR THE DB CONNECTION.
    if (!_is_a_valid_db_name(_db_name)) {
      throw {
        _status: 500,
        _code: "db_name_required_or_invalid",
        _message: "Database name is required or invalid.",
      };
    }

    // CREATE MONGOOSE CONNECTION.
    const connection = await mongoose
      .createConnection(process.env.DB_CONNECTION_URL, {
        authSource: "admin",
        dbName: _db_name.toString().trim(),
        family: 6,
        socketTimeoutMS: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .asPromise();
    // /CREATE MONGOOSE CONNECTION.

    await _attach_models(connection);
    return connection;
  } catch (_caught_error) {
    throw { _status: 500, _code: "ise_mdc", _message: "Please, try again." }; // ise_mdc = Internal Server Error - Mongo DB Connection
  }
};

const mw_db_connect = async (req, res, next) => {
  try {
    req.db_connection = await connect_to_db(process.env.MASTER_DB_NAME);
  } catch (_caught_error) {
    return next(_caught_error);
  }

  return next();
};

module.exports.db_connection = { mw_db_connect, connect_to_db };
