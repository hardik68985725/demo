import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";

process.env.AWS_S3_BUCKET_SIGNED_URL_EXPIRES_IN = (1000 *
  60 *
  60 *
  5) as unknown as string;
const AWS_S3_BUCKET_SIGNED_URL_EXPIRES_IN = 1000 * 60 * 60 * 6;

const _get_s3_client = (): S3Client => {
  const s3_configuration: Record<string, unknown> = {
    region: process.env.AWS_REGION
  };
  if (process.env.ENV_NAME === "development") {
    s3_configuration.credentials = {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    };
  }
  return new S3Client(s3_configuration);
};

const upload_file = async (_data: TMyAwsS3BucketFileInformation) => {
  if (
    !(
      _data &&
      _data.store_at &&
      _data.store_at.toString().trim().length > 0 &&
      _data.filename &&
      _data.filename.toString().trim().length > 0 &&
      existsSync(
        path.join(
          process.env.MEDIA_UPLOAD_DIRECTORY as string,
          _data.filename.toString().trim()
        )
      )
    )
  ) {
    return;
  }

  const store_at = _data.store_at.toString().trim();
  const filename = _data.filename.toString().trim();
  const object_key = path.join(store_at, filename).replaceAll("\\", "/");
  const s3_client = _get_s3_client();

  return await s3_client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: object_key,
      Body: readFileSync(
        path.join(process.env.MEDIA_UPLOAD_DIRECTORY as string, filename)
      )
    })
  );
};

const copy_file = async (_data: TMyAwsS3BucketFileInformation) => {
  if (
    !(
      _data &&
      _data.store_at &&
      _data.store_at.toString().trim().length > 0 &&
      _data.filename &&
      _data.filename.toString().trim().length > 0 &&
      _data.destination &&
      _data.destination.toString().trim().length > 0
    )
  ) {
    return;
  }
  const store_at = _data.store_at.toString().trim();
  const filename = _data.filename.toString().trim();
  const destination = _data.destination.toString().trim();
  const source_object_key = path.join(store_at, filename).replaceAll("\\", "/");
  const source_object_key_with_bucket = path
    .join(process.env.AWS_S3_BUCKET_NAME as string, store_at, filename)
    .replaceAll("\\", "/");
  const destination_object_key = path
    .join(destination, filename)
    .replaceAll("\\", "/");
  const s3_client = _get_s3_client();

  if (!(await is_object_existed(source_object_key))) {
    return;
  }

  return await s3_client.send(
    new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: destination_object_key,
      CopySource: source_object_key_with_bucket
    })
  );
};

const get_file_url = async (_data: TMyAwsS3BucketFileInformation) => {
  if (
    !(
      _data &&
      _data.store_at &&
      _data.store_at.toString().trim().length > 0 &&
      _data.filename &&
      _data.filename.toString().trim().length > 0
    )
  ) {
    return;
  }
  const store_at = _data.store_at.toString().trim();
  const filename = _data.filename.toString().trim();
  const object_key = path.join(store_at, filename).replaceAll("\\", "/");
  const s3_client = _get_s3_client();

  const s3_command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: object_key
  });

  return await getSignedUrl(s3_client, s3_command, {
    expiresIn: AWS_S3_BUCKET_SIGNED_URL_EXPIRES_IN / 1000
  });
};

const delete_file = async (_data: TMyAwsS3BucketFileInformation) => {
  if (
    !(
      _data &&
      _data.store_at &&
      _data.store_at.toString().trim().length > 0 &&
      _data.filename &&
      _data.filename.toString().trim().length > 0
    )
  ) {
    return;
  }

  const store_at = _data.store_at.toString().trim();
  const filename = _data.filename.toString().trim();
  const object_key = path.join(store_at, filename).replaceAll("\\", "/");
  const s3_client = _get_s3_client();

  return await s3_client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: object_key
    })
  );
};

const is_object_existed = async (_object_key: string) => {
  if (!(_object_key && _object_key.toString().trim().length > 0)) {
    return;
  }

  try {
    const s3_client = _get_s3_client();
    const result_head_object_command = await s3_client.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: _object_key
      })
    );
    return result_head_object_command.$metadata.httpStatusCode === 200;
  } catch (error) {
    return false;
  }
};

export { upload_file, copy_file, get_file_url, delete_file };

type TMyAwsS3BucketFileInformation = {
  store_at: string;
  filename: string;
  destination?: string;
};
