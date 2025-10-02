import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EventFacade } from '../../domain/EventFacade';
import { UserFacade } from '../../../user/domain/UserFacade';
import { FileFacade } from '../../../file/domain/FileFacade';
import { injectable, inject } from 'tsyringe';
import { createAppError } from '../../../../middleware/errorMiddleware';
import { generatePresignedUrlForObjectKey } from '../../../../utils/s3';
import logger from '../../../../utils/logger';

@injectable()
export class EventController {
  constructor(
    @inject('EventFacade') private readonly eventFacade: EventFacade,
    @inject('UserFacade') private readonly userFacade: UserFacade,
    @inject('FileFacade') private readonly fileFacade: FileFacade,
  ) {}

  getEventDetails = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await this.eventFacade.getEventById(eventId);

    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    const user = await this.userFacade.getUserByUsername(event.username);

    if (!user) {
      throw createAppError(404, 'User not found');
    }

    let signedImageUrl = null;
    if (event.imagePlaceholderObjectKey) {
      try {
        signedImageUrl = await generatePresignedUrlForObjectKey(event.imagePlaceholderObjectKey);
      } catch (error) {
        logger.error('Error generating signed URL:', error);
      }
    }

    const files = await this.fileFacade.getFilesByUsername(event.username);
    const eventFiles = files.filter((file) => file.eventId === event.eventId);

    res.render('events/details', {
      event: { ...event, signedImageUrl },
      user,
      files: eventFiles,
    });
  });
}
