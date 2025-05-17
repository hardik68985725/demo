const {
  isValidObjectId,
  Types: { ObjectId: mongodb_objectid },
} = require("mongoose");

const db_connection_close = async (req) => {
  await req?.db_connection?.close();
};

const is_mongodb_objectid = (_value) => {
  return isValidObjectId(_value);
};

module.exports.my_db = {
  db_connection_close,
  is_mongodb_objectid,
  mongodb_objectid,
};
