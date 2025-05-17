import mongoose from "mongoose";
import { utility } from "@app_root/core/helpers";
import { default as modules } from "@app_root/app_modules/index";

const mongodb_objectid = mongoose.Types.ObjectId;

const is_mongodb_objectid = (_value: any) => {
  return mongoose.isValidObjectId(_value);
};

const get_regex_field_for_aggregation = (
  text: string,
  full_text: boolean = true
) => {
  const regex_string = full_text
    ? `^${utility.escape_regexp(text.trim())}$`
    : utility.escape_regexp(text.trim());

  return {
    $regex: new RegExp(regex_string).toString().replaceAll("/", ""),
    $options: "i"
  } as Record<string, string>;
};

const get_pagination_pipeline = (options: TPaginationPipelineOptions) => {
  let data_list_field_name = "data_list";
  if (
    options.data_list_field_name &&
    options.data_list_field_name.toString().trim()
  ) {
    data_list_field_name = options.data_list_field_name.toString().trim();
  }

  let page_no = 0;
  if (options.page_no && parseInt(options.page_no.toString(), 10) > 0) {
    page_no = parseInt(options.page_no.toString(), 10);
  }

  let no_of_rows_per_page = 10;
  if (
    options.rows_per_page &&
    parseInt(options.rows_per_page.toString(), 10) > 0
  ) {
    no_of_rows_per_page = parseInt(options.rows_per_page.toString(), 10);
    if (parseInt(options.rows_per_page.toString()) > 100) {
      no_of_rows_per_page = 100;
    }
  }

  const skip = page_no * no_of_rows_per_page;

  const _remaining_rows = {
    $subtract: ["$total_rows", no_of_rows_per_page * (page_no + 1)]
  };

  const data_pagination: Array<mongoose.PipelineStage> = [
    {
      $facet: {
        pagination: [
          { $count: "total_rows" },
          {
            $addFields: {
              remaining_rows: {
                $cond: [{ $lt: [_remaining_rows, 0] }, 0, _remaining_rows]
              }
            }
          }
        ],
        [data_list_field_name]: [
          { $skip: skip },
          { $limit: no_of_rows_per_page }
        ]
      }
    },
    {
      $addFields: {
        pagination: { $first: "$pagination" },
        [data_list_field_name]: {
          $cond: [
            {
              $and: [
                { $size: "$pagination" },
                { $gt: ["$pagination.total_rows", 0] }
              ]
            },
            `$${data_list_field_name}`,
            "$$REMOVE"
          ]
        }
      }
    }
  ];

  return data_pagination;
};

const add_model_to_db_connection = async (connection: mongoose.Connection) => {
  for (const _module of modules) {
    if (!_module.is_disabled) {
      for (const _dbschema of _module.dbschemas) {
        connection.model(_dbschema.model_name, _dbschema.schema);
      }
    }
  }
};

const connect_to_db = async (_db_name: string) => {
  mongoose.Promise = Promise;

  try {
    _db_name = _db_name.toString().trim();

    // CREATE MONGOOSE CONNECTION.
    const connection = await mongoose
      .createConnection(process.env.DB_CONNECTION_URL as string, {
        authSource: "admin",
        dbName: _db_name,
        socketTimeoutMS: 0
      })
      .asPromise();
    // /CREATE MONGOOSE CONNECTION.

    await add_model_to_db_connection(connection);
    return connection;
  } catch (error) {
    __line__;
    console.my_log_point("error", error);
    throw { _status: 500, _code: "ise_mdc", _message: "Please, try again." }; // ise_mdc = Internal Server Error - Mongo DB Connection
  }
};

type TPaginationPipelineOptions = {
  page_no: number;
  rows_per_page: number;
  data_list_field_name: String;
};

export {
  connect_to_db,
  mongodb_objectid,
  is_mongodb_objectid,
  get_pagination_pipeline,
  get_regex_field_for_aggregation
};
