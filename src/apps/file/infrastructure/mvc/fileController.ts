import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FileFacade } from '../../domain/FileFacade';
import { injectable, inject } from 'tsyringe';
import { UserFacade } from '../../../user/domain/UserFacade';
import { EventFacade } from '../../../event/domain/EventFacade';
import { createAppError } from '../../../../middleware/errorMiddleware';

@injectable()
export class FileController {
  constructor(
    @inject('FileFacade') private readonly fileFacade: FileFacade,
    @inject('UserFacade') private readonly userFacade: UserFacade,
    @inject('EventFacade') private readonly eventFacade: EventFacade,
  ) {}

  showUploadForm = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    
    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    const user = await this.userFacade.getUserByUsername(event.username);
    if (!user) {
      throw createAppError(404, 'User not found');
    }

    res.render('files/upload', {
      username: event.username,
      eventId: event.eventId,
    });
  }
};
