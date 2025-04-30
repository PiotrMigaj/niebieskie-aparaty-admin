import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EventFacade } from '../../domain/EventFacade';
import { injectable, inject } from 'tsyringe';
import { User } from '../../../user/domain/User';
import { createAppError } from '../../../../middleware/errorMiddleware';
import { File } from '../../../file/File';

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

  updateEventImagePlaceholder = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { imagePlaceholderObjectKey } = req.body;
    await this.eventFacade.updateEventImagePlaceholder(eventId, imagePlaceholderObjectKey);
    res.status(200).json({ message: 'Event updated successfully' });
  });
}
