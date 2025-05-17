const {
  my_db: { db_connection_close },
} = require("../helpers/helpers.index");

module.exports.mw_onclose_response = (req, res, next) => {
  const on_close = async () => {
    res.removeListener("close", on_close);

    await db_connection_close(req);
  };

  res.on("close", on_close);

  return next();
};
