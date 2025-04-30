import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EventFacade } from '../../domain/EventFacade';
import { UserFacade } from '../../../user/domain/UserFacade';
import { injectable, inject } from 'tsyringe';
import { createAppError } from '../../../../middleware/errorMiddleware';

@injectable()
export class EventController {
  constructor(
    @inject('EventFacade') private readonly eventFacade: EventFacade,
    @inject('UserFacade') private readonly userFacade: UserFacade,
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

    res.render('events/details', { event, user });
  });
}
