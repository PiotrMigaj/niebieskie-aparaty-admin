import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EventFacade } from '../../domain/EventFacade';
import { injectable, inject } from 'tsyringe';
import { UserFacade } from '../../../user/domain/UserFacade';
import { FileFacade } from '../../../file/domain/FileFacade';
import { createAppError } from '../../../../middleware/errorMiddleware';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../../../../config/s3config';
import { generatePresignedUrlForObjectKey } from '../../../../utils/s3';
import logger from '../../../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class EventRestController {
  constructor(
    // eslint-disable-next-line no-unused-vars
    @inject('EventFacade') private readonly eventFacade: EventFacade,
    // eslint-disable-next-line no-unused-vars
    @inject('UserFacade') private readonly userFacade: UserFacade,
    // eslint-disable-next-line no-unused-vars
    @inject('FileFacade') private readonly fileFacade: FileFacade,
  ) {}

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, title, username, imagePlaceholderObjectKey } = req.body;
    const user = await this.userFacade.getUserByUsername(username);
    if (!user) {
      throw createAppError(404, 'User with such username does not exist');
    }
    const eventDto = await this.eventFacade.createEvent(
      date,
      description,
      title,
      username,
      imagePlaceholderObjectKey,
    );
    res.status(201).json({ eventDto });
  });

  getEventsByUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await this.userFacade.getUserByUsername(username);
    if (!user) {
      throw createAppError(404, 'User with such username does not exist');
    }
    const events = await this.eventFacade.getEventsByUsername(username);
    const files = await this.fileFacade.getFilesByUsername(username);

    // Generate signed URLs for event placeholder images
    const eventsWithSignedUrls = await Promise.all(
      events.map(async (event) => {
        let signedImageUrl = null;
        if (event.imagePlaceholderObjectKey) {
          try {
            signedImageUrl = await generatePresignedUrlForObjectKey(
              event.imagePlaceholderObjectKey,
            );
          } catch (error) {
            logger.error('Error generating signed URL:', error);
          }
        }

        const eventFiles = files.filter((file) => file.eventId === event.eventId);

        return {
          ...event,
          signedImageUrl,
          filesDto: eventFiles,
        };
      }),
    );

    res.status(200).json({ eventsDto: eventsWithSignedUrls });
  });

  getEventById = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    let signedImageUrl = null;
    if (event.imagePlaceholderObjectKey) {
      try {
        signedImageUrl = await generatePresignedUrlForObjectKey(event.imagePlaceholderObjectKey);
      } catch (error) {
        logger.error('Error generating signed URL:', error);
      }
    }

    res.render('events/details', { event: { ...event, signedImageUrl } });
  });

  updateEventImagePlaceholder = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { imagePlaceholderObjectKey } = req.body;
    await this.eventFacade.updateEventImagePlaceholder(eventId, imagePlaceholderObjectKey);
    res.status(200).json({ message: 'Event updated successfully' });
  });

  generateUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const { filename, contentType, username, eventId } = req.body;

    if (!filename || !contentType || !username || !eventId) {
      throw createAppError(400, 'Missing required parameters');
    }

    const key = `${username}/${eventId}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 900, // 15 minutes
      });

      res.status(200).json({
        presignedUrl,
        key,
      });
    } catch (error) {
      throw createAppError(500, 'Failed to generate upload URL');
    }
  });

  toggleCamelGallery = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { camelGallery } = req.body;

    if (typeof camelGallery !== 'boolean') {
      throw createAppError(400, 'camelGallery must be a boolean value');
    }

    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    await this.eventFacade.updateCamelGallery(eventId, camelGallery);
    res.status(200).json({ message: 'Gallery status updated successfully', camelGallery });
  });

  updateToken = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { validDays } = req.body;

    if (typeof validDays !== 'number' || !Number.isInteger(validDays) || validDays < 1) {
      throw createAppError(400, 'validDays must be a positive integer');
    }

    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    const tokenId = uuidv4();
    const tokenIdCreatedAt = new Date().toISOString().split('T')[0];
    const tokenIdValidDays = String(validDays);

    await this.eventFacade.updateToken(eventId, tokenId, tokenIdCreatedAt, tokenIdValidDays);

    res.status(200).json({ message: 'Token updated successfully', tokenId, tokenIdCreatedAt, tokenIdValidDays });
  });

  toggleSelectionAvailable = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { selectionAvailable } = req.body;

    if (typeof selectionAvailable !== 'boolean') {
      throw createAppError(400, 'selectionAvailable must be a boolean value');
    }

    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    await this.eventFacade.updateSelectionAvailable(eventId, selectionAvailable);
    res.status(200).json({ 
      message: 'Selection availability updated successfully',
      selectionAvailable 
    });
  });
}
