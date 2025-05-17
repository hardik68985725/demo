import { join } from "node:path";
import { Request } from "express";
import { my_utc } from "@app_root/core/helpers";
import { get_file_url } from "@app_root/core/helpers/my_aws/my_aws_s3_bucket.helper";

const update_and_get_product_image_file_url = async (
  req: Request,
  _product_data: Array<Record<string, unknown>>
) => {
  if (!(_product_data && _product_data.length)) {
    return;
  }

  let to_bucket: string = "system";
  if (req.app_data.auth.organization?.toString().trim()) {
    to_bucket = req.app_data.auth.organization?.toString().trim();
  }

  for (const v_product of _product_data as any) {
    if (
      v_product?.image?.s3_bucket?.created_at &&
      v_product?.image?.s3_bucket?.url
    ) {
      let s3_bucket_url = v_product.image.s3_bucket.url;
      const s3_bucket_url_created_at = v_product.image.s3_bucket.created_at;

      if (
        !s3_bucket_url ||
        my_utc().isSameOrAfter(
          my_utc(s3_bucket_url_created_at).add(
            process.env.AWS_S3_BUCKET_SIGNED_URL_EXPIRES_IN,
            "ms"
          )
        )
      ) {
        s3_bucket_url = await get_file_url({
          store_at: join(to_bucket, "product"),
          filename: v_product.image.filename
        });

        await req.app_data.db_connection.models.product.findByIdAndUpdate(
          v_product._id,
          {
            updated_by: req.app_data.auth.created_by,
            "image.s3_bucket": { created_at: new Date(), url: s3_bucket_url }
          }
        );
      }
      v_product.image = {
        originalname: v_product.image.originalname,
        url: s3_bucket_url
      };
    }
  }
};

export { update_and_get_product_image_file_url };
