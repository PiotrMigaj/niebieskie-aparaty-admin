import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FileFacade } from '../../domain/FileFacade';
import { injectable, inject } from 'tsyringe';
import { createAppError } from '../../../../middleware/errorMiddleware';
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../../../../config/s3config';

interface CreateFileRequest {
  description: string;
  eventId: string;
  username: string;
  objectKey: string | null;
}

@injectable()
export class FileRestController {
  constructor(@inject('FileFacade') private readonly fileFacade: FileFacade) {}

  createFile = asyncHandler(async (req: Request, res: Response) => {
    const { description, eventId, username, objectKey } = req.body as CreateFileRequest;
    const fileDto = await this.fileFacade.createFile(description, eventId, username, objectKey);
    res.status(201).json({ fileDto });
  });

  initMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const { filename, contentType, username, eventId } = req.body;

    if (!filename || !contentType || !username || !eventId) {
      throw createAppError(400, 'Missing required parameters');
    }

    const key = `${username}/${eventId}/${filename}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    try {
      const { UploadId } = await s3Client.send(command);
      res.status(200).json({ uploadId: UploadId, key });
    } catch (error) {
      throw createAppError(500, 'Failed to initialize multipart upload');
    }
  });

  getPartUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const { key, uploadId, partNumber } = req.body;

    if (!key || !uploadId || !partNumber) {
      throw createAppError(400, 'Missing required parameters');
    }

    const command = new UploadPartCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      res.status(200).json({ presignedUrl });
    } catch (error) {
      throw createAppError(500, 'Failed to generate part upload URL');
    }
  });

  completeMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const { key, uploadId, parts } = req.body;

    if (!key || !uploadId || !parts) {
      throw createAppError(400, 'Missing required parameters');
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });

    try {
      await s3Client.send(command);
      res.status(200).json({ message: 'Multipart upload completed successfully' });
    } catch (error) {
      // Attempt to abort the upload
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
      });
      await s3Client.send(abortCommand);
      throw createAppError(500, 'Failed to complete multipart upload');
    }
  });
}
