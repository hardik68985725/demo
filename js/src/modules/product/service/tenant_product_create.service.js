const path = require("path");
const {
  my_aws_s3_bucket: { copy_file, get_file_url },
  utility: { escape_regexp },
} = require("../../../helpers/helpers.index");
const {
  db_connection: { connect_to_db },
} = require("../../../db_connection/db_connection.index");
const {
  joischema_product_view,
} = require("../joischema/product_view.joischema");

module.exports.tenant_product_create = async (_req) => {
  if (!(_req && (_req._auth.is_tenant_owner || _req._auth.can_access))) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_product_view(
    _req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  // GET PRODUCT DATA FROM SYSTEM DB.
  const query_system_product_data = await _req.db_connection.models.product
    .findOne({ _id: body_data._id })
    .select({ _id: 1, name: 1, group: 1, price: 1, image: 1 })
    .lean()
    .exec();
  if (!query_system_product_data) {
    throw {
      _status: 400,
      _code: "not_exists",
      _message: "Product is invalid.",
    };
  }
  if (
    !(
      query_system_product_data?.image?.filename &&
      query_system_product_data.image.filename.toString().trim().length > 0
    )
  ) {
    throw {
      _status: 400,
      _code: "image_is_not_exists",
      _message: "Sorry, right now, this product is not cloneable.",
    };
  }
  // /GET PRODUCT DATA FROM SYSTEM DB.

  // GET PRODUCT GROUP DATA FROM SYSTEM DB.
  const query_system_product_group_data = await _req.db_connection.models.group
    .findOne({ _id: query_system_product_data.group })
    .select({ _id: 1, name: 1 })
    .lean()
    .exec();
  // /GET PRODUCT GROUP DATA FROM SYSTEM DB.

  // CREATE TENANT DB CONNECTION.
  const tenant_db_connection = await connect_to_db(
    process.env.TENANT_DB_NAME_PREFIX.concat(_req._auth.tenant)
  );
  // /CREATE TENANT DB CONNECTION.

  // GET PRODUCT DATA FROM TENANT DB.
  let query_tenant_product_data = await tenant_db_connection.models.product
    .findOne({
      name: new RegExp(
        `^${escape_regexp(query_system_product_data.name)}$`,
        "i"
      ),
    })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (query_tenant_product_data) {
    throw {
      _status: 400,
      _code: "already_exists",
      _message: "Product is already exists.",
    };
  }
  // /GET PRODUCT DATA FROM TENANT DB.

  // GET GROUP DATA FROM TENANT DB.
  let query_tenant_group_data = await tenant_db_connection.models.group
    .findOne({
      name: new RegExp(
        `^${escape_regexp(query_system_product_group_data.name)}$`,
        "i"
      ),
    })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (!query_tenant_group_data) {
    // COPY SYSTEM DB GROUP DATA TO TENANT DB.
    query_tenant_group_data =
      await tenant_db_connection.models.group.insertMany({
        created_by: _req._auth.created_by,
        name: query_system_product_group_data.name,
      });
    if (query_tenant_group_data.length > 0) {
      query_tenant_group_data = { _id: query_tenant_group_data[0]._id };
    }
    // /COPY SYSTEM DB GROUP DATA TO TENANT DB.
  }
  // /GET GROUP DATA FROM TENANT DB.

  // COPY PRODUCT IMAGE FROM SYSTEM BUCKET TO RESPECTIVE TENANT BUCKET.
  const destination = `${
    process.env.AWS_S3_BUCKET_TENANT_FOLDER_NAME_PREFIX
  }${path.join(_req._auth.tenant.toString().trim(), "product")}`;

  await copy_file({
    store_at: path.join("system", "product"),
    filename: query_system_product_data.image.filename,
    destination: destination,
  });
  // /COPY PRODUCT IMAGE FROM SYSTEM BUCKET TO RESPECTIVE TENANT BUCKET.

  // PREPARE THE PRODUCT IMAGE OBJECT TO ADD INTO PRODUCT DATA OF TENANT DB.
  const product_image = {
    filename: query_system_product_data.image.filename,
    originalname: query_system_product_data.image.originalname,
    encoding: query_system_product_data.image.encoding,
    mimetype: query_system_product_data.image.mimetype,
    size: query_system_product_data.image.size,
    s3_bucket: {
      created_at: new Date(),
      url: await get_file_url({
        store_at: destination,
        filename: query_system_product_data.image.filename,
      }),
    },
  };
  // /PREPARE THE PRODUCT IMAGE OBJECT TO ADD INTO PRODUCT DATA OF TENANT DB.
  const {
    quarantine = 0,
    name,
    color,
    duration = 0,
    tolerance = 0,
    group,
    price = 0, // Default to 0 if price is not provided
  } = query_system_product_data;

  let limitData = {
    quarantine: Number(quarantine),
  };

  query_tenant_product_data =
    await tenant_db_connection.models.product.insertMany({
      created_by: _req._auth.created_by,
      name: name,
      color: color,
      limit: limitData,
      duration: Number(duration),
      tolerance: Number(tolerance),
      group: group,
      price: Number(price), // Ensure price is a number
      image: product_image,
    });
  if (query_tenant_product_data.length > 0) {
    query_tenant_product_data = { _id: query_tenant_product_data[0]._id };
  }
  // /COPY SYSTEM DB PRODUCT TO TENANT DB PRODUCT.

  // GET ALL PLU DATA OF SYSTEM DB.
  const query_system_product_plu_data = await _req.db_connection.models.plu
    .find({ product: query_system_product_data._id })
    .select({ _id: 0, name: 1, size_name: 1, code: 1, duration: 1, limit: 1 })
    .lean()
    .exec();
  // /GET ALL PLU DATA OF SYSTEM DB.

  if (query_system_product_plu_data.length > 0) {
    // LOOP THROUGH THE PLU DATA AND ADD NEEDED FIELDS.
    for (const v_plu of query_system_product_plu_data) {
      v_plu.created_by = _req._auth.created_by;
      v_plu.product = query_tenant_product_data._id;
      v_plu.size_name = v_plu.size_name ? v_plu.size_name : "Size Name";
    }
    // /LOOP THROUGH THE PLU DATA AND ADD NEEDED FIELDS.

    // COPY SYSTEM DB PRODUCT PLU TO TENANT DB PRODUCT PLU.
    await tenant_db_connection.models.plu.insertMany(
      query_system_product_plu_data
    );
    // /COPY SYSTEM DB PRODUCT PLU TO TENANT DB PRODUCT PLU.
  }

  await tenant_db_connection.close();

  return {
    _message: "Product created successfully.",
    _data: query_tenant_product_data,
  };
};
