const path = require("path");
const { unlinkSync } = require("fs");
const {
  my_aws_s3_bucket: { upload_file, get_file_url, delete_file },
  utility: { escape_regexp },
} = require("../../../helpers/helpers.index");
const {
  joischema_product_update,
} = require("../joischema/product_update.joischema");
const {
  mw_multipart_formdata,
} = require("../../../middlewares/middlewares.index");

module.exports.method = "patch";
module.exports.route_path = "/:_id";
module.exports.middlewares = [
  mw_multipart_formdata("image", "product", null, null, 1),
];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_product_update({
    ...req.body,
    ...req.params,
  });
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const group_data_count = await req.db_connection.models.group
    .countDocuments({ _id: body_data.group })
    .lean()
    .exec();
  if (!(group_data_count > 0)) {
    throw { _status: 400, _code: "not_exists", _message: "Group is invalid." };
  }

  const product_data_by_name = await req.db_connection.models.product
    .findOne({ name: new RegExp(`^${escape_regexp(body_data.name)}$`, "i") })
    .select({ _id: 1 })
    .lean()
    .exec();
  if (
    product_data_by_name &&
    product_data_by_name._id.toString() !== body_data._id.toString()
  ) {
    throw {
      _status: 400,
      _code: "already_exists",
      _message: `${body_data.name} is already exists.`,
    };
  }

  if (
    req.uploaded_file_list &&
    Array.isArray(req.uploaded_file_list) &&
    req.uploaded_file_list.length > 0
  ) {
    const query_product_data = await req.db_connection.models.product
      .findOne({ _id: body_data._id })
      .select({ "image.filename": 1 })
      .lean()
      .exec();

    if (
      query_product_data &&
      query_product_data.image &&
      query_product_data.image.filename
    ) {
      await delete_file({
        store_at: path.join("system", "product"),
        filename: query_product_data.image.filename,
      });
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
  }

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
  const query_update_product = { _id: body_data._id };

  const updated_product_data =
    await req.db_connection.models.product.updateMany(query_update_product, {
      updated_by: req._auth.created_by,
      name,
      color,
      limit: limitData,
      duration: Number(duration),
      tolerance: Number(tolerance),
      group,
      price: Number(price), // Ensure price is a number
      image,
    });
  if (!(updated_product_data?.modifiedCount > 0)) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  return { _message: "Product updated successfully." };
};
