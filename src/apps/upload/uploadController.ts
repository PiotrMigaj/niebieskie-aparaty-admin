import { Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../../config/s3config';
import logger from '../../utils/logger';

interface UploadRequestBody {
  filename: string;
  contentType: string;
  username: string;
  eventId: string;
}

export const generatePresignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, contentType, username, eventId } = req.body as UploadRequestBody;

    // Validate required fields
    if (!filename || !contentType || !username || !eventId) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Generate the object key
    const key = `${username}/${eventId}/${filename}`;

    // Create the S3 command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    // Return the presigned URL to the client
    res.status(200).json({
      presignedUrl,
      key,
    });
  } catch (error) {
    logger.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const renderUploadPage = (req: Request, res: Response): void => {
  res.render('upload', {
    title: 'S3 File Uploader',
    pageTitle: 'Upload File to S3',
  });
};
