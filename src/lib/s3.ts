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

export function buildLessonAssetKey(
  courseId: string,
  lessonId: string,
  filename: string
) {
  return `courses/${courseId}/${lessonId}/${filename}`;
}

export async function getLessonAssetUrl(
  courseId: string,
  lessonId: string,
  filename: string,
  expiresInSeconds = 3600
) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: buildLessonAssetKey(courseId, lessonId, filename),
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function getLessonAssetUploadUrl(
  courseId: string,
  lessonId: string,
  filename: string,
  contentType: string,
  expiresInSeconds = 3600
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: buildLessonAssetKey(courseId, lessonId, filename),
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
