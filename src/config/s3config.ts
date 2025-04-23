import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1', // Default to Frankfurt region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key-id',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-access-key',
  },
});

export const S3_BUCKET_NAME = 'niebieskie-aparaty-client-gallery';
