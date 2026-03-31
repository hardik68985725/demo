import { MongoClient, ObjectId, Document, InsertOneResult } from "mongodb";
import { utility } from "@app_root/core/helpers";
import { dbSchemas, TDbSchema } from "@app_root/core/types";

const isMongodbObjectId = (value: unknown): boolean => {
  if (typeof value !== "string" || !ObjectId.isValid(value)) return false;

  try {
    return new ObjectId(value).toHexString() === value;
  } catch {
    return false;
  }
};

const getRegexFieldForAggregation = (
  text: string,
  isFullText: boolean = true
): Record<string, string> => {
  const regex_string = isFullText
    ? `^${utility.escapeRegexp(text.trim())}$`
    : utility.escapeRegexp(text.trim());

  return {
    $regex: new RegExp(regex_string).toString().replaceAll("/", ""),
    $options: "i"
  };
};

const getPaginationPipeline = (
  options: TPaginationPipelineOptions
): Document[] => {
  options.pageNo = parseInt(String(options.pageNo ?? "").trim(), 10);
  options.rowsPerPage = parseInt(String(options.rowsPerPage ?? "").trim(), 10);

  const pageNo =
    Number.isInteger(options.pageNo) && options.pageNo > 0 ? options.pageNo : 0;

  const rowsPerPage =
    Number.isInteger(options.rowsPerPage) && options.rowsPerPage > 0
      ? Math.min(options.rowsPerPage, 50)
      : 10;

  const dataListFieldName =
    String(options.dataListFieldName ?? "").trim() || "data_list";

  const skip = pageNo * rowsPerPage;

  const remainingRows = {
    $subtract: ["$total_rows", rowsPerPage * (pageNo + 1)]
  };

  const dataPagination: Document[] = [
    {
      $facet: {
        pagination: [
          { $count: "total_rows" },
          {
            $addFields: {
              remaining_rows: {
                $cond: [{ $lt: [remainingRows, 0] }, 0, remainingRows]
              }
            }
          }
        ],
        [dataListFieldName]: [{ $skip: skip }, { $limit: rowsPerPage }]
      }
    },
    {
      $addFields: {
        pagination: { $first: "$pagination" },
        [dataListFieldName]: {
          $cond: [
            {
              $and: [
                { $size: "$pagination" },
                { $gt: ["$pagination.total_rows", 0] }
              ]
            },
            `$${dataListFieldName}`,
            "$$REMOVE"
          ]
        }
      }
    }
  ];

  return dataPagination;
};

const addCollectionsToDbConnection = (
  connection: ReturnType<MongoClient["db"]>
) => {
  const collectionsMap = {} as {
    [K in TDbSchema]: ReturnType<typeof connection.collection>;
  };

  for (const _dbSchema of dbSchemas) {
    collectionsMap[_dbSchema] = connection.collection(_dbSchema);
  }

  return collectionsMap;
};

const connectToDb = async (dbName: string) => {
  dbName = dbName.trim();

  const client = new MongoClient(process.env.DB_CONNECTION_URL, {
    directConnection: true,
    authSource: "admin",
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    minPoolSize: 1,
    maxPoolSize: 1
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = addCollectionsToDbConnection(db);
    return { client, db, collections };
  } catch (error) {
    await client.close();
    __line__;
    myLogger.error(error);
    throw { _status: 500, _code: "ise_mdc", _message: "Please, try again." }; // ise_mdc = Internal Server Error - Mongo DB Connection
  }
};

type TPaginationPipelineOptions = {
  pageNo: number;
  rowsPerPage: number;
  dataListFieldName: string;
};

export {
  connectToDb,
  isMongodbObjectId,
  getPaginationPipeline,
  getRegexFieldForAggregation,
  ObjectId as mongodbObjectId,
  InsertOneResult as mongodbInsertOneResult
};
