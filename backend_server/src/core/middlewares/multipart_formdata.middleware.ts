import { extname } from "node:path";
import { randomUUID as uuidv4 } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import multer from "multer";

const mediaConfiguration = {
  fileNamePrefix: "file",
  maxFileSize: 1024 * 1024 * 1, // 1MB
  minFileSize: 1024, // 1KB
  maxFileUploadCount: 1,
  storeAt: process.env.MEDIA_UPLOAD_DIRECTORY!,
  allowedFileTypes: [
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
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ]
} as const;

const mw_multipart_formdata = (
  fileFieldName: string,
  fileNamePrefix: string = mediaConfiguration.fileNamePrefix,
  maxFileSize: number = mediaConfiguration.maxFileSize,
  minFileSize: number = mediaConfiguration.minFileSize,
  maxFileUploadCount: number = mediaConfiguration.maxFileUploadCount
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!(fileFieldName && fileFieldName.toString().trim().length > 0)) {
      /* error = {
        _code: "required_file_field",
        _message: "File field name is required.",
      }; */

      return next();
    }

    if (!(fileNamePrefix && fileNamePrefix.toString().trim().length > 0)) {
      fileNamePrefix = mediaConfiguration.fileNamePrefix;
    }
    if (!(maxFileSize && Number.isSafeInteger(maxFileSize))) {
      maxFileSize = mediaConfiguration.maxFileSize;
    }
    if (!(minFileSize && Number.isSafeInteger(minFileSize))) {
      minFileSize = mediaConfiguration.minFileSize;
    }
    if (!(maxFileUploadCount && Number.isSafeInteger(maxFileUploadCount))) {
      maxFileUploadCount = mediaConfiguration.maxFileUploadCount;
    }

    multer({
      // Configuration of multer disk storage.
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          return cb(null, mediaConfiguration.storeAt);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          return cb(null, `${fileNamePrefix}_${uuidv4()}_${Date.now()}${ext}`);
        }
      }),
      // Configuration of multer file filter.
      fileFilter: (req, file, cb: Function) => {
        if (!req) {
          return cb(null, true);
        }

        if (
          !(
            mediaConfiguration.allowedFileTypes as unknown as string[]
          ).includes(file.mimetype)
        ) {
          return cb(
            {
              _code: "invalid_mime_type",
              _message: "File mime type is invalid."
            },
            false
          );
        }

        if (
          parseInt(
            (req.header("content-length") as string).toString().trim(),
            10
          ) < minFileSize
        ) {
          return cb(
            {
              _code: "file_size_is_to_small",
              _message: `Minimum ${minFileSize} bytes size is needed to upload.`
            },
            false
          );
        }

        return cb(null, true);
      },
      limits: { fileSize: maxFileSize }
    }).array(fileFieldName, maxFileUploadCount)(req, res, (error) => {
      if (error) {
        delete req.files;

        if (error.field && !(error.field === fileFieldName)) {
          error = {
            _code: "required_file_field",
            _message: "File field name is required."
          };
        }

        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            error = {
              _code: "file_size_is_to_large",
              _message: `Maximum ${maxFileSize} bytes size is allowed to upload.`
            };
          } else if (error.code === "LIMIT_FILE_COUNT") {
            error = {
              _code: "max_files_allowed",
              _message: `Maximum ${maxFileUploadCount} files are allowed to upload.`
            };
          } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
            error = {
              _code: "max_files_allowed",
              _message: `Maximum ${maxFileUploadCount} files are allowed to upload.`
            };
          }
        }

        return next(error);
      }

      const files: Express.Multer.File[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const vFile of req.files) {
          vFile.mediaId = vFile.filename.split("_")[1];
          files[files.length] = vFile;
        }
        delete req.files;
      }
      req.appData.validationData.uploadedFileList = files;

      return next();
    });
  };
};

export { mw_multipart_formdata };
