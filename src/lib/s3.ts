import "server-only";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.S3_BUCKET ?? process.env.S3_BUCKET_NAME;

if (!bucketName) {
  throw new Error("S3_BUCKET (or S3_BUCKET_NAME) environment variable is not set");
}

const s3Client = new S3Client({
  region: process.env.S3_REGION ?? process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: process.env.S3_URL_STYLE === "path",
  // Tigris (and most non-AWS S3-compatible providers) don't support the
  // CRC32 request checksums the SDK attaches by default since v3.729,
  // which breaks signature validation with SignatureDoesNotMatch.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: (process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY)!,
  },
});

function buildLessonAssetKey(courseId: string, lessonId: string, filename: string) {
  return `courses/${courseId}/${lessonId}/${Date.now()}-${filename}`;
}

export async function getSignedUploadUrl(
  courseId: string,
  lessonId: string,
  filename: string,
  contentType: string,
  expiresInSeconds = 3600
) {
  const key = buildLessonAssetKey(courseId, lessonId, filename);
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return { url, key };
}

export async function getSignedGetUrl(key: string, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function ensureBucketCors() {
  await s3Client.send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ["*"],
            AllowedMethods: ["PUT", "GET", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    })
  );
}
