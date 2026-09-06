import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

function getClientInfo() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing S3 credentials");
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  contentType = "image/jpeg",
): Promise<{ imageUrl: string; publicId: string }> {
  const bucket = process.env.STORAGE_BUCKET;
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;

  if (!bucket || !endpoint) {
    throw new Error("Missing S3 credentials");
  }

  const Key = `support-tasks/${randomUUID()}`;

  await getClientInfo().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const baseUrl = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;

  return {
    publicId: Key,
    imageUrl: `${baseUrl}/${bucket}/${Key}`,
  };
}
