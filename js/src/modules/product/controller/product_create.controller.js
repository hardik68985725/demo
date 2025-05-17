const path = require("path");
const { unlinkSync } = require("fs");
const {
  my_aws_s3_bucket: { upload_file, get_file_url },
  utility: { escape_regexp },
} = require("../../../helpers/helpers.index");
const {
  joischema_product_create,
} = require("../joischema/product_create.joischema");
const {
  mw_role,
  mw_multipart_formdata,
} = require("../../../middlewares/middlewares.index");
const {
  service_product: { tenant_product_create },
} = require("../service/product.service");

// -----------------------------------------------------------------------------

module.exports.method = "post";
module.exports.route_path = "/";
module.exports.middlewares = [
  mw_role("product", "write", true),
  mw_multipart_formdata("image", "product", null, null, 1),
];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    return await tenant_product_create(req);
  }

  const { body_data, validation_errors } = await joischema_product_create(
    req.body
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  if (
    !(
      req.uploaded_file_list &&
      Array.isArray(req.uploaded_file_list) &&
      req.uploaded_file_list.length > 0
    )
  ) {
    throw {
      _status: 400,
      _code: "required_image",
      _message: "Product image is required.",
    };
  }

  const group_data_count = await req.db_connection.models.group
    .countDocuments({ _id: body_data.group })
    .lean()
    .exec();
  if (!(group_data_count > 0)) {
    throw {
      _status: 400,
      _code: "not_exists",
      _message: "Group is invalid.",
    };
  }

  const product_data_count_by_name = await req.db_connection.models.product
    .countDocuments({
      name: new RegExp(`^${escape_regexp(body_data.name)}$`, "i"),
    })
    .lean()
    .exec();
  if (product_data_count_by_name > 0) {
    throw {
      _status: 400,
      _code: "already_exists",
      _message: `${body_data.name} is already exists.`,
    };
  }

  body_data.image = {
    filename: req.uploaded_file_list[0].filename,
    originalname: req.uploaded_file_list[0].originalname,
    encoding: req.uploaded_file_list[0].encoding,
    mimetype: req.uploaded_file_list[0].mimetype,
    size: req.uploaded_file_list[0].size,
  };

  await upload_file({
    store_at: path.join("system", "product"),
    filename: body_data.image.filename,
  });

  const file_path = path.join(
    process.env.MEDIA_UPLOAD_DIRECTORY,
    body_data.image.filename
  );
  unlinkSync(file_path);

  body_data.image.s3_bucket = {
    created_at: new Date(),
    url: await get_file_url({
      store_at: path.join("system", "product"),
      filename: body_data.image.filename,
    }),
  };
  const {
    quarantine = 0,
    name,
    color,
    duration,
    tolerance,
    group,
    price = 0, // Default to 0 if price is not provided
    image,
  } = body_data;

  let limitData = {
    quarantine: Number(quarantine),
  };

  let query_tenant_product_data =
    await req.db_connection.models.product.insertMany({
      created_by: req._auth.created_by,
      name: name,
      color: color,
      limit: limitData,
      duration: Number(duration),
      tolerance: Number(tolerance),
      group: group,
      price: Number(price), // Ensure price is a number
      image: image,
    });
  if (query_tenant_product_data.length > 0) {
    query_tenant_product_data = { _id: query_tenant_product_data[0]._id };
  }

  return {
    _message: "Product created successfully.",
    _data: query_tenant_product_data,
  };
};
