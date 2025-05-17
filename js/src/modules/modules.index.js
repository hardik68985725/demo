const path = require("path");
const { existsSync, readdirSync, statSync } = require("fs");
const express = require("express");
const router = express.Router();

const {
  db_connection: { mw_db_connect },
} = require("../db_connection/db_connection.index");
const {
  mw_auth,
  mw_handle_controller,
} = require("../middlewares/middlewares.index");

const {
  my_type: { get_boolean },
} = require("../helpers/helpers.index");

const modules = modules_up();

/**
 * LOAD ALL MODULES.
 */
function modules_up() {
  const _module_list = module_list();

  load_module(_module_list);
  clean_module(_module_list);
  load_route(_module_list);

  return _module_list;
}

/**
 * LIST OUT FILES OF MODULE.
 */
function module_list() {
  // LIST ALL THE FOLDERS INTO /modules FOLDER.
  const module_dir = readdirSync(path.join(__dirname));

  // TO STORE ALL THE MODULE DATA.
  const _module_list = [];

  // LOOP THROUGH ALL THE FOLDERS AND FILES OF /modules FOLDER.
  for (let i = 0; i < module_dir.length; i++) {
    /**
     * CURRENT MODULE = MODULE WHICH IS IN LOOP module_dir[i].
     */

    // CHECK IF MODULE FOLDER NAME CONTAINS SPACE OR NOT.
    if (!module_dir[i].includes(" ")) {
      // PATH OF CURRENT MODULE.
      const module_dir_path = path.join(__dirname, module_dir[i]);

      // STATISTICS OF PATH OF CURRENT MODULE.
      const module_dir_stat = statSync(module_dir_path);

      // TO STORE MODULE DATA. LIKE name, file_path, ETC.
      const module_data = {};

      // CHECK THAT CURRENT MODULE IS FOLDER OR NOT.
      if (module_dir_stat.isDirectory()) {
        module_data.type = "module";
        module_data.name = module_dir[i];

        // PREPARE MODULE FILE PATH.
        const module_file_path = path.join(
          module_dir_path,
          module_data.name.concat(".module.js")
        );

        // CHECK FOR MODULE FILE EXISTS OR NOT.
        if (existsSync(module_file_path)) {
          module_data.file_path = module_file_path;

          // BIND ALL RESPECTIVE CONTROLLERS OF MODULE.
          controller_list(module_data);

          // BIND ALL RESPECTIVE SCHEMAS OF MODULE.
          dbschema_list(module_data);

          // ADD MODULE DATA INTO MODULE LIST.
          _module_list.push(module_data);
        }
      }
    }
  }

  return _module_list;
}

/**
 * LIST OUT FILES OF CONTROLLER.
 */
function controller_list(_module) {
  // TO STORE PATH OF CONTROLLER FOLDER OF MODULE.
  const controller_dir_path = path.join(__dirname, _module.name, "controller");

  // CHECK FOR CONTROLLER FILE EXISTS OR NOT.
  if (existsSync(controller_dir_path)) {
    // LIST ALL THE FOLDERS INTO /controller FOLDER.
    const controller_dir = readdirSync(controller_dir_path);

    // TO STORE ALL THE CONTROLLER DATA.
    _module.controller = [];

    // LOOP THROUGH ALL THE FOLDERS AND FILES OF /controller FOLDER OF MODULE.
    for (let i = 0; i < controller_dir.length; i++) {
      // TO STORE CONTROLLER DATA. LIKE name, file_path, middleware, ETC.
      const controller_data = {};
      controller_data.module_name = _module.name;
      controller_data.type = "controller";
      controller_data.name = controller_dir[i].replace(".controller.js", "");
      controller_data.file_path = path.join(
        controller_dir_path,
        controller_dir[i]
      );

      // ADD CONTROLLER DATA INTO CONTROLLER LIST OF MODULE.
      _module.controller.push(controller_data);
    }
  }
}

/**
 * LIST OUT FILES OF SCHEMA.
 */
function dbschema_list(_module) {
  // TO STORE PATH OF SCHEMA FOLDER OF MODULE.
  const dbschema_dir_path = path.join(__dirname, _module.name, "dbschema");

  // CHECK FOR SCHEMA FILE EXISTS OR NOT.
  if (existsSync(dbschema_dir_path)) {
    // LIST ALL THE FOLDERS INTO /dbschema FOLDER.
    const dbschema_dir = readdirSync(dbschema_dir_path);

    // TO STORE ALL THE SCHEMA DATA.
    _module.dbschema = [];

    // LOOP THROUGH ALL THE FOLDERS AND FILES OF /dbschema FOLDER OF MODULE.
    for (let i = 0; i < dbschema_dir.length; i++) {
      // TO STORE SCHEMA DATA. LIKE name, file_path, ETC.
      const dbschema_data = {};
      dbschema_data.module_name = _module.name;
      dbschema_data.type = "dbschema";
      dbschema_data.name = dbschema_dir[i].replace(".dbschema.js", "");
      dbschema_data.file_path = path.join(dbschema_dir_path, dbschema_dir[i]);

      // ADD SCHEMA DATA INTO SCHEMA LIST OF MODULE.
      _module.dbschema.push(dbschema_data);
    }
  }
}

/**
 * LOAD EACH MODULE WITH RESPECTIVE CONTROLLERS, SCHEMAS AND SERVICES.
 */
function load_module(_data) {
  // LOOP THROUGH ALL THE MODULES.
  for (let i = 0; i < _data.length; i++) {
    // GRAB KEYS OF MODULE, SO WE CAN LOOP THROUGH KEYS AND LOAD FILES.
    const _data_props = Object.keys(_data[i]);

    // LOOP THROUGH THE MODULES KEYS, SO LOAD FILES OF CONTROLLERS, SCHEMAS AND SERVICES.
    for (let j = 0; j < _data_props.length; j++) {
      if (_data_props[j] === "controller") {
        // CHECK FOR KEY THAT IS CONTROLLER OR NOT, SO LOAD CONTROLLERS BY CALLING SAME FUNCTION.
        load_module(_data[i].controller);
      } else if (_data_props[j] === "dbschema") {
        // CHECK FOR KEY THAT IS SCHEMA OR NOT, SO LOAD SCHEMAS BY CALLING SAME FUNCTION.
        load_module(_data[i].dbschema);
      } else if (_data_props[j] === "file_path") {
        // STORE THE PATH OF MODULE OR CONTROLLER.
        const _file_path = _data[i][_data_props[j]];

        if (_data[i].type === "module") {
          // CHECK THAT THE PATH IS FOR MODULE.
          // LOAD THE FILE.
          const _module_file = require(_file_path);

          // STORE DATA OF MODULE, LIKE is_disabled, route_path, ETC.

          /**
           * is_disabled IS DEFAULT false,
           * is_disabled IS FOR WHETHER THE MODULE NEEDS TO BE REMOVED OR NOT FROM THE MODULE LIST.
           * IT IS LIKE MODULE ENABLED OR DISABLED.
           */
          _data[i].is_disabled = get_boolean(_module_file.is_disabled);

          // route_path IS KIND OF PREFIX OF ENDPOINT.
          _data[i].route_path = _module_file.route_path;
          // /STORE DATA OF MODULE, LIKE is_disabled, route_path, ETC.
        } else if (_data[i].type === "controller") {
          // CHECK THAT THE PATH IS FOR CONTROLLER.
          // LOAD THE FILE.
          const _controller_file = require(_file_path);

          // STORE DATA OF CONTROLLER, LIKE method, route_path, ETC.
          if (get_boolean(_controller_file.is_disabled)) {
            _data[i].is_disabled = true;
          }
          if (_controller_file.method) {
            _data[i].method = _controller_file.method.trim().toLowerCase();
          }
          if (_controller_file.route_path) {
            _data[i].route_path = _controller_file.route_path;
          }
          if (_controller_file.middlewares) {
            _data[i].middlewares = _controller_file.middlewares;
          }
          if (_controller_file.controller) {
            _data[i].controller = _controller_file.controller;
          }
          if (
            _controller_file.is_auth_required !== undefined &&
            !get_boolean(_controller_file.is_auth_required)
          ) {
            // IF is_auth_required PROPERTY OF CONTROLLER IS NOT SET OR FALSE THEN REMOVE IT FROM MODULE LIST.
            delete _data[i].is_auth_required;
          } else {
            // BY DEFAULT is_auth_required IS TRUE SO mw_auth MIDDLEWARE APPLY FOR ALL ROUTES.
            _data[i].is_auth_required = true;
          }
          // /STORE DATA OF CONTROLLER, LIKE method, route_path, ETC.
        } else if (_data[i].type === "dbschema") {
          // CHECK THAT THE PATH IS FOR SCHEMA.

          // LOAD THE FILE.
          const _dbschema_file = require(_file_path);

          // STORE DATA OF SCHEMA, LIKE model_name, dbschema object, ETC.
          _data[i].model_name = _dbschema_file.model_name;
          _data[i].dbschema = _dbschema_file.dbschema;
          _data[i].is_for_master_db = _dbschema_file.is_for_master_db;
          _data[i].is_for_device_db = _dbschema_file.is_for_device_db;
          _data[i].is_for_tenant_db = _dbschema_file.is_for_tenant_db;
          // /STORE DATA OF SCHEMA, LIKE model_name, dbschema object, ETC.
        }
      }
    }
  }
}

/**
 * CLEAN MODULE, REMOVE MODULES FROM LIST WHICH HAVE is_disabled VALUE false.
 */
function clean_module(_data) {
  // LOOP THROUGH THE MODULES.
  for (let i = 0; i < _data.length; i++) {
    /**
     * CHECK THAT MODULE PROPERTY is_disabled IS true OR NOT.
     * IF IT IS THEN REMOVE THE MODULE.
     */
    if (_data[i].is_disabled) {
      // REMOVE MODULE FROM LIST.
      _data.splice(i, 1);
      // DECREMENT ITERATOR SO CHECK NEXT MODULE.
      i = i - 1;
    }

    /**
     * LOOP THROUGH THE MODULES TO REMOVE REPEATED ROUTE PATH OF MODULE.
     */
    for (let j = 0; j < _data.length; j++) {
      // CHECK WHETHER BOTH LOOPS MODULE ARE NOT ON SAME INDEX.
      if (i > 0 && i !== j) {
        // CHECK ROUTE PATH OR NAME ARE SAME OR NOT.
        if (
          _data[i].route_path === _data[j].route_path ||
          _data[i].name === _data[j].name
        ) {
          // REMOVE MODULE FROM LIST.
          _data.splice(i, 1);
          // DECREMENT ITERATOR SO CHECK NEXT MODULE.
          i = i - 1;
        }
      }
    }
  }
}

/**
 * LOAD ROUTE FILE AND BIND IT WITH EXPRESS ROUTER.
 */
function load_route(_module) {
  // LOOP THROUGH THE MODULES.
  for (let i = 0; i < _module.length; i++) {
    // IT CAN BE POSSIBLE THAT THE MODULE DOES NOT HAVE ANY CONTROLLER. WHEN YOU WANT TO CONFIGURE IT MANUALLY.
    if (_module[i].controller) {
      // LOOP THROUGH THE CONTROLLERS.
      for (let j = 0; j < _module[i].controller.length; j++) {
        // CHECK FOR CONTROLLER SETUP IS DISABLED OR NOT.
        if (!_module[i].controller[j].is_disabled) {
          // CHECK FOR REQUEST METHOD IS VALID OR NOT.
          if (
            _module[i].controller[j].method?.toString().trim().length > 0 &&
            ["post", "get", "patch", "delete"].includes(
              _module[i].controller[j].method?.toString().trim().toLowerCase()
            )
          ) {
            // CHECK THAT ROUTE_PATH IS SET OR NOT.
            if (_module[i].controller[j].route_path) {
              // PREPARE FULL ROUTE PATH. LIKE /[MODULE PREFIX]/[CONTROLLER ENDPOINT].
              const route_path = _module[i].route_path.concat(
                _module[i].controller[j].route_path
              );

              const middlewares = [mw_db_connect, mw_auth];
              if (!_module[i].controller[j].is_auth_required) {
                // REMOVE mw_auth FROM LIST.
                middlewares.splice(1, 1);
              }

              if (
                _module[i].controller[j].middlewares &&
                Array.isArray(_module[i].controller[j].middlewares) &&
                _module[i].controller[j].middlewares.length > 0
              ) {
                for (
                  let k = 0;
                  k < _module[i].controller[j].middlewares.length;
                  k++
                ) {
                  // ADD ALL THE CONFIGURED MIDDLEWARE INTO CONTROLLER.
                  middlewares.push(_module[i].controller[j].middlewares[k]);
                }
              }

              /**
               * FINALLY BIND THE ROUTE PATH, MIDDLEWARE FUNCTIONS AND CONTROLLER FUNCTION.
               */
              router[_module[i].controller[j].method](
                route_path,
                middlewares,
                mw_handle_controller(_module[i].controller[j].controller)
              );
            }
          }
        }
      }
    }
  }
}

/**
 * LOAD SCHEMA FILES IN ONE ARRAY.
 */
function load_dbschema(_module) {
  // TO STORE LIST OF SCHEMAS.
  const module_dbschema = [];

  // LOOP THROUGH THE MODULES.
  for (let i = 0; i < _module.length; i++) {
    // IT CAN BE POSSIBLE THAT THE MODULE DOES NOT HAVE ANY SCHEMA.
    if (_module[i].dbschema) {
      // LOOP THROUGH THE SCHEMAS OF MODULE.
      for (let j = 0; j < _module[i].dbschema.length; j++) {
        // ADD SCHEMA INTO MODULE.
        module_dbschema.push(_module[i].dbschema[j]);
      }
    }
  }

  // RETURN LIST OF SCHEMA.
  return module_dbschema;
}

module.exports.module_list = modules;
module.exports.module_router = router;
module.exports.module_dbschema = load_dbschema(modules);
