import { TMyLogger } from "@app_root/core/helpers/my_logger.helper";
import { TAppData, TResponse } from "@app_root/core/types";

declare global {
  var __root_path__: string;
  var __line__: unknown;
  var myLogger: TMyLogger;

  namespace NodeJS {
    interface ProcessEnv {
      ENV_NAME: string;
      PORT: string;
      DB_CONNECTION_URL: string;
      DB_NAME: string;
      APP_PUBLIC_URL: string;
      MAIN_SERVER_URL: string;
      AUTH_TOKEN_EXPIRE_AFTER_IN_MILLISECONDS?: string;
      RESET_PASSWORD_EXPIRE_AFTER_IN_MILLISECONDS?: string;
      HASH_SALT_ROUNDS?: string;
      MEDIA_UPLOAD_DIRECTORY?: string;
      APP_FROM_EMAIL_ADDRESS: string;
    }
  }

  namespace Express {
    namespace Multer {
      export interface File {
        mediaId: string;
      }
    }

    export interface Request {
      appData: TAppData;
    }

    export interface Locals {
      __response: TResponse;
    }
  }
}

export {};
