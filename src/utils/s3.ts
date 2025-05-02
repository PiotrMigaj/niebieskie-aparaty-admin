import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_BUCKET_NAME, s3Client } from '../config/s3config';
import logger from './logger';

export const generatePresignedUrlForObjectKey = async (objectKey: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: objectKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return presignedUrl;
  } catch (err) {
    logger.error('Error generating presigned URL:', err);
    throw err;
  }
};
