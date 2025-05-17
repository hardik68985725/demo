const path = require("path");
const {
  my_aws_s3_bucket: { delete_file },
} = require("../../../helpers/helpers.index");
const {
  joischema_product_delete,
} = require("../joischema/product_delete.joischema");

module.exports.method = "delete";
module.exports.route_path = "/:_id";
module.exports.middlewares = [];
module.exports.controller = async (req) => {
  if (!req._auth.is_system_owner) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  const { body_data, validation_errors } = await joischema_product_delete(
    req.params
  );
  if (validation_errors) {
    throw { _status: 400, _code: "bad_input", _message: validation_errors };
  }

  const plu_data_count = await req.db_connection.models.plu
    .countDocuments({ product: body_data._id })
    .lean()
    .exec();
  if (plu_data_count > 0) {
    throw {
      _status: 403,
      _code: "assigned_product",
      _message: "Used product cannot be removed.",
    };
  }

  const query_product_data = await req.db_connection.models.product
    .findOne({ _id: body_data._id })
    .select({ "image.filename": 1 })
    .lean()
    .exec();

  const deleted_product_data =
    await req.db_connection.models.product.deleteMany({
      created_by: req._auth.created_by,
      _id: body_data._id,
    });
  if (!(deleted_product_data?.deletedCount > 0)) {
    throw { _status: 403, _code: "forbidden", _message: "Forbidden" };
  }

  await delete_file({
    store_at: path.join("system", "product"),
    filename: query_product_data.image.filename,
  });

  return { _message: "Product deleted successfully." };
};
