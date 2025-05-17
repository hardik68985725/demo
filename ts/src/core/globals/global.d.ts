import Joi from "joi";
import { Connection } from "mongoose";
import { my_db } from "@app_root/core/helpers";

declare global {
  var __root_path__: string;
  var __line__: unknown;

  namespace NodeJS {
    interface ProcessEnv {}
  }

  interface Console {
    my_log_point: Function;
  }

  namespace Express {
    namespace Multer {
      export interface File {
        media_id: string;
      }
    }

    export interface Request {
      app_data: TAppData;
    }

    export interface Response {
      locals: { __response: TResponse };
    }
  }
}

type TResponse = {
  _status?: number;
  _code?: string;
  _message?: string;
  _data: any;
};

type TAppData = {
  auth: TAuth;
  db_connection: Connection;
  subdomain: string;
  maca: string;
  useragent: TUserAgent;
  validation_data: TValidationData;
};

type TAuth = {
  created_by?: my_db.mongodb_objectid;
  organization?: my_db.mongodb_objectid;
  role?: Record<string, any>;
  can_access?: boolean;
  is_system_owner: boolean;
  is_organization_owner: boolean;
  user?: TUser;
};

type TUser = {
  _id: my_db.mongodb_objectid;
  email: string;
};

type TUserAgent = {
  browser?: string;
  os?: string;
  platform?: string;
  source?: string;
  version?: string;
};

type TValidationData = {
  uploaded_file_list?: Array<Express.Multer.File>;
  input_data?: Record<string, any>;
  validated_input_data?: Record<string, any>;
  validation_errors?: string | Array<Joi.ValidationErrorItem>;
};

export {};
