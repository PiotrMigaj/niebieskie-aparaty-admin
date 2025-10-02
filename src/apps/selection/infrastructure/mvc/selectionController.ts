import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { injectable, inject } from 'tsyringe';
import { createAppError } from '../../../../middleware/errorMiddleware';
import { SelectionFacade } from '../../domain/SelectionFacade';
import { EventFacade } from '../../../event/domain/EventFacade';

@injectable()
export class SelectionController {
  constructor(
    @inject('SelectionFacade') private readonly selectionFacade: SelectionFacade,
    @inject('EventFacade') private readonly eventFacade: EventFacade,
  ) {}

  createSelectionPage = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { eventId, eventTitle, username } = req.query;

      if (!eventId || !eventTitle || !username) {
        throw createAppError(400, 'Missing required parameters: eventId, eventTitle, and username are required');
      }

      // Check if selection already exists for this event
      const existingSelection = await this.selectionFacade.getSelectionByEventId(eventId as string);
      if (existingSelection) {
        // Redirect to event details if selection already exists
        return res.redirect(`/events/${eventId}`);
      }

      res.render('selection/create-selection', {
        eventId: eventId as string,
        eventTitle: eventTitle as string,
        username: username as string,
      });
    } catch (error) {
      console.error('Error in createSelectionPage:', error);
      throw error;
    }
  });

  createSelection = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, eventTitle, username, maxPhotos } = req.body;

    if (!eventId || !eventTitle || !username || !maxPhotos) {
      throw createAppError(400, 'Missing required fields: eventId, eventTitle, username, and maxPhotos are required');
    }

    const maxNumberOfPhotos = parseInt(maxPhotos);
    if (isNaN(maxNumberOfPhotos) || maxNumberOfPhotos < 1 || maxNumberOfPhotos > 100) {
      throw createAppError(400, 'maxPhotos must be a number between 1 and 100');
    }

    // Verify that the event exists
    const event = await this.eventFacade.getEventById(eventId);
    if (!event) {
      throw createAppError(404, 'Event not found');
    }

    try {
      // Create the selection
      await this.selectionFacade.createSelection(eventId, eventTitle, maxNumberOfPhotos, username);

      // Update the event to set selectionAvailable to true
      await this.eventFacade.updateSelectionAvailable(eventId, true);

      // Redirect to event details page
      res.redirect(`/events/${eventId}`);
    } catch (error: any) {
      if (error.statusCode === 409) {
        // Selection already exists, redirect to event details
        res.redirect(`/events/${eventId}`);
      } else {
        throw error;
      }
    }
  });

  selectionDetails = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        throw createAppError(400, 'Event ID is required');
      }

      // Fetch selection by event ID using DynamoDB scan operation
      const selection = await this.selectionFacade.getSelectionByEventId(eventId);
      if (!selection) {
        throw createAppError(404, 'Selection not found for this event');
      }

      res.render('selection/details', {
        selection: selection,
      });
    } catch (error) {
      console.error('Error in selectionDetails:', error);
      throw error;
    }
  });
}