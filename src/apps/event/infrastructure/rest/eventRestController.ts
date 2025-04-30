import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EventFacade } from '../../domain/EventFacade';
import { injectable, inject } from 'tsyringe';
import { User } from '../../../user/domain/User';
import { createAppError } from '../../../../middleware/errorMiddleware';
import { File } from '../../../file/File';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../../../../config/s3config';

@injectable()
export class EventRestController {
  constructor(@inject('EventFacade') private readonly eventFacade: EventFacade) {}

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { date, description, title, username, imagePlaceholderObjectKey } = req.body;
    const userExists = await User.existsByUsername(username);
    if (!userExists) {
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
    const userExists = await User.existsByUsername(username);
    if (!userExists) {
      throw createAppError(404, 'User with such username does not exist');
    }
    const events = await this.eventFacade.getEventsByUsername(username);
    const files = await File.findByUsername(username);
    const eventsDto = events.map((event) => {
      const eventFiles = files.filter((file) => file.getEventId() === event.eventId);
      const filesDto = eventFiles.map((file) => file.toResponse());
      return {
        ...event,
        filesDto: filesDto,
      };
    });
    res.status(200).json({ eventsDto });
  });

  getEventById = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }
    res.render('events/details', { event });
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
}
