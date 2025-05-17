const {
  service_common: {
    service_media: { clear_uploaded_file_list },
  },
} = require("../modules/common/service/common.service");
const { get_exception_object } = require("../helpers/helpers.index");

// eslint-disable-next-line no-unused-vars
module.exports.mw_response_error = async (error, req, res, next) => {
  console.log(error);

  // REMOVE UPLOADED FILES IF THE REQUEST HAS AN ERROR.
  await clear_uploaded_file_list(req);

  return res
    .status(error._status || 400)
    .send(
      get_exception_object(
        error._status,
        error._code,
        error._message,
        error._data
      )
    );
};
