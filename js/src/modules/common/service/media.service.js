const { existsSync, unlinkSync } = require("fs");

const clear_uploaded_file_list = async (_req) => {
  if (
    _req.uploaded_file_list &&
    Array.isArray(_req.uploaded_file_list) &&
    _req.uploaded_file_list.length > 0
  ) {
    for (const v_file of _req.uploaded_file_list) {
      if (existsSync(v_file.path)) {
        unlinkSync(v_file.path);
      }
    }
  }
};

module.exports.service_media = { clear_uploaded_file_list };
