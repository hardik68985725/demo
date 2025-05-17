const path = require("path");
const multer = require("multer");

const media_configuration = Object.freeze({
  file_name_prefix: "file",
  max_file_size: 1024 * 1024 * 1, // 1MB
  min_file_size: 1024, // 1KB
  max_file_upload_count: 5,
  store_at: process.env.MEDIA_UPLOAD_DIRECTORY,
  allowed_file_types: [
    "text/plain",
    "text/csv",
    "image/bmp",
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
});

module.exports.mw_multipart_formdata = (
  _file_field_name,
  _file_name_prefix,
  _max_file_size,
  _min_file_size,
  _max_file_upload_count
) => {
  return (req, res, next) => {
    if (!(_file_field_name && _file_field_name.toString().trim().length > 0)) {
      /* _error = {
        _code: "required_file_field",
        _message: "File field name is required.",
      }; */

      return next();
    }

    if (
      !(_file_name_prefix && _file_name_prefix.toString().trim().length > 0)
    ) {
      _file_name_prefix = media_configuration.file_name_prefix;
    }
    if (!(_max_file_size && Number.isSafeInteger(_max_file_size))) {
      _max_file_size = media_configuration.max_file_size;
    }
    if (!(_min_file_size && Number.isSafeInteger(_min_file_size))) {
      _min_file_size = media_configuration.min_file_size;
    }
    if (
      !(_max_file_upload_count && Number.isSafeInteger(_max_file_upload_count))
    ) {
      _max_file_upload_count = media_configuration.max_file_upload_count;
    }

    multer({
      // CONFIGURATION OF MULTER DISK STORAGE
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          return cb(null, media_configuration.store_at);
        },
        filename: (_req, _file, cb) => {
          const ext = path.extname(_file.originalname);
          return cb(
            null,
            `${_file_name_prefix}_${__uuidv4()}_${Date.now()}${ext}`
          );
        },
      }),
      // CONFIGURATION OF MULTER FILE FILTER
      fileFilter: (_req, _file, cb) => {
        if (!media_configuration.allowed_file_types.includes(_file.mimetype)) {
          return cb(
            {
              _code: "invalid_mime_type",
              _message: "File mime type is invalid.",
            },
            false
          );
        }

        if (
          parseInt(_req.header("content-length").toString().trim(), 10) <
          _min_file_size
        ) {
          return cb(
            {
              _code: "file_size_is_to_small",
              _message: `Minimum ${_min_file_size} bytes size is needed to upload.`,
            },
            false
          );
        }

        return cb(null, true);
      },
      limits: { fileSize: _max_file_size },
    }).array(_file_field_name, _max_file_upload_count)(req, null, (_error) => {
      if (_error) {
        delete req.files;

        if (_error.field && !(_error.field === _file_field_name)) {
          _error = {
            _code: "required_file_field",
            _message: "File field name is required.",
          };
        }

        if (_error instanceof multer.MulterError) {
          if (_error.code === "LIMIT_FILE_SIZE") {
            _error = {
              _code: "file_size_is_to_large",
              _message: `Maximum ${_max_file_size} bytes size is allowed to upload.`,
            };
          } else if (_error.code === "LIMIT_FILE_COUNT") {
            _error = {
              _code: "max_files_allowed",
              _message: `Maximum ${_max_file_upload_count} files are allowed to upload.`,
            };
          } else if (_error.code === "LIMIT_UNEXPECTED_FILE") {
            _error = {
              _code: "max_files_allowed",
              _message: `Maximum ${_max_file_upload_count} files are allowed to upload.`,
            };
          }
        }

        return next(_error);
      }

      const files = [];
      if (req.files && Array.isArray(req.files)) {
        for (const v_file of req.files) {
          v_file.media_id = v_file.filename.split("_")[1];
          files.push(v_file);
        }
        delete req.files;
      }
      req.uploaded_file_list = files;

      return next();
    });
  };
};
