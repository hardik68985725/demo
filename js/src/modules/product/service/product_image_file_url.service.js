const path = require("path");
const {
  my_aws_s3_bucket: { get_file_url },
  my_db: { is_mongodb_objectid },
} = require("../../../helpers/helpers.index");

// -----------------------------------------------------------------------------

const update_and_get_product_image_file_url = async (
  _db_connection,
  _auth,
  _product_data,
  _tenant_id
) => {
  if (_tenant_id && _tenant_id.toString().trim().length > 0) {
    if (!is_mongodb_objectid(_tenant_id)) {
      __line_number_print;
      console.log(`Parameter _tenant_id(${_tenant_id}) is invalid`);
      return;
    }
  }

  if (_product_data && Array.isArray(_product_data) && _product_data.length) {
    for (const v_product of _product_data) {
      if (
        v_product?.image?.s3_bucket?.created_at &&
        v_product?.image?.s3_bucket?.url
      ) {
        let s3_bucket_url = v_product.image.s3_bucket.url;
        const s3_bucket_url_created_at = v_product.image.s3_bucket.created_at;
        if (
          !s3_bucket_url ||
          __moment().isSameOrAfter(
            __moment(s3_bucket_url_created_at).add(
              process.env.AWS_S3_BUCKET_SIGNED_URL_EXPIRES_IN,
              "ms"
            )
          )
        ) {
          s3_bucket_url = await get_file_url({
            store_at: path.join(_tenant_id || "system", "product"),
            filename: v_product.image.filename,
          });

          await _db_connection.models.product.updateMany(
            { _id: v_product._id },
            {
              updated_by: _auth.created_by,
              "image.s3_bucket": { created_at: new Date(), url: s3_bucket_url },
            }
          );
        }
        v_product.image = {
          originalname: v_product.image.originalname,
          url: s3_bucket_url,
        };
      }
    }
  }
};

module.exports.update_and_get_system_product_image_file_url = async (
  _db_connection,
  _auth,
  _product_data
) => {
  await update_and_get_product_image_file_url(
    _db_connection,
    _auth,
    _product_data
  );
};

module.exports.update_and_get_tenant_product_image_file_url = async (
  _db_connection,
  _auth,
  _product_data,
  _tenant_id
) => {
  await update_and_get_product_image_file_url(
    _db_connection,
    _auth,
    _product_data,
    _tenant_id
  );
};
