import "server-only";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.S3_BUCKET ?? process.env.S3_BUCKET_NAME;

if (!bucketName) {
  throw new Error("S3_BUCKET (or S3_BUCKET_NAME) environment variable is not set");
}

const s3Client = new S3Client({
  region: process.env.S3_REGION ?? process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_URL_STYLE === "path",
  credentials: {
    accessKeyId: (process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY)!,
  },
});

function buildLessonAssetKey(courseId: string, lessonId: string, filename: string) {
  return `courses/${courseId}/${lessonId}/${Date.now()}-${filename}`;
}

export async function uploadLessonAsset(
  courseId: string,
  lessonId: string,
  file: { name: string; type: string; buffer: Buffer }
) {
  const key = buildLessonAssetKey(courseId, lessonId, file.name);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.type,
    })
  );
  return key;
}

export async function getSignedGetUrl(key: string, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
