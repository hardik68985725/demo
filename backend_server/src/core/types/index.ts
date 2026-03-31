import { RequestHandler } from "express";
import { MongoClient, Db, Collection } from "mongodb";
import { my_joi, my_db } from "@app_root/core/helpers";
import { dbSchemas, TDbSchema } from "@app_root/core/types/db_schema.type";

export { dbSchemas, TDbSchema };

export type TResponse = {
  _status?: number;
  _code?: string;
  _message?: string;
  _data: any;
};

export type TAppData = {
  auth: TAuth;
  dbConnection?: TDbConnection;
  subdomain: string;
  useragent: TUserAgent;
  validationData: TValidationData;
};

export type TAuth = { user?: TUser };

export type TUser = {
  _id: my_db.mongodbObjectId;
  email: string;
  organization: TDocumentOrQuery;
  role: TDocumentOrQuery;
  ownDataQuery?: { created_by: my_db.mongodbObjectId };
};

export type TUserAgent = {
  browser?: string;
  os?: string;
  platform?: string;
  source?: string;
  version?: string;
};

export type TValidationData = {
  uploadedFileList?: Array<Express.Multer.File>;
  inputData?: Record<string, any>;
  validatedInputData?: Record<string, any>;
  validationErrors?: string | Array<my_joi.ValidationErrorItem>;
};

export type TDbConnection = {
  client: MongoClient;
  db: Db;
  collections: { [K in TDbSchema]: Collection } & Record<string, Collection>;
};

export type TModule = {
  isEnabled?: boolean;
  routePath: string;
  controllers: Array<TController>;
};

type TAllowedMethods = "post" | "get" | "patch" | "delete";
export type TController = {
  isEnabled?: boolean;
  isAuthRequired?: boolean;
  method: TAllowedMethods;
  routePath: string;
  middlewares: Array<RequestHandler>;
  controller: Function;
};

export type TDocumentOrQuery =
  | undefined
  | null
  | ({
      _id?: my_db.mongodbObjectId;
      organization?: my_db.mongodbObjectId | TDocumentOrQuery;
      created_at?: Date;
      created_by?: my_db.mongodbObjectId;
      updated_at?: Date;
      updated_by?: my_db.mongodbObjectId;
    } & {
      [key: string]:
        | Array<any>
        | boolean
        | Date
        | number
        | object
        | string
        | my_db.mongodbObjectId;
    });
