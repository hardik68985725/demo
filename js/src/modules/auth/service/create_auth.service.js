const bcrypt = require("bcrypt");

module.exports.create_auth = async (_db_connection, _created_by) => {
  // CHECK FOR ENOUGH DATA
  if (!_db_connection) {
    return false;
  }
  if (!_created_by) {
    return false;
  }
  // /CHECK FOR ENOUGH DATA

  // IF AUTH DATA IS ALREADY THERE THEN NEED TO CHECK IF IT IS EXPIRED OR NOT
  let auth_data = await _db_connection.models.auth
    .findOne({ created_by: _created_by })
    .lean()
    .exec();

  if (
    auth_data &&
    __moment().isSameOrAfter(
      __moment(auth_data.created_at).add(
        process.env.DEFAULT_AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS,
        "ms"
      )
    )
  ) {
    // FIRST REMOVE EXISTING AUTH DATA TOKENS SO CAN CREATE NEW ONE
    await _db_connection.models.auth.deleteMany({ created_by: _created_by });
    // /FIRST REMOVE EXISTING AUTH DATA TOKENS SO CAN CREATE NEW ONE

    // FREE THE auth_data TO CREATE NEW ONE
    auth_data = undefined;
  }
  // /IF AUTH DATA IS ALREADY THERE THEN NEED TO CHECK IF IT IS EXPIRED OR NOT

  if (!auth_data) {
    // GENERATE TOKEN
    const token = bcrypt.hashSync(
      _created_by.toString(),
      parseInt(process.env.HASH_SALTROUNDS, 10)
    );
    // /GENERATE TOKEN

    // CREATE TOKEN IN DB
    auth_data = await _db_connection.models.auth.create({
      created_by: _created_by,
      token,
    });
    // /CREATE TOKEN IN DB
  }

  return auth_data;
};
