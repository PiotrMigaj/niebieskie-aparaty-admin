import { injectable } from 'tsyringe';
import { Event, EventDto } from './Event';
import { EventFacade } from './EventFacade';
import { createAppError } from '../../../middleware/errorMiddleware';

@injectable()
export class EventFacadeImpl implements EventFacade {
  async createEvent(
    date: string,
    description: string,
    title: string,
    username: string,
    imagePlaceholderObjectKey: string | null = null,
  ): Promise<EventDto> {
    const event = new Event(date, description, title, username, imagePlaceholderObjectKey);
    const savedEvent = await event.save();
    return savedEvent.toResponse();
  }

  async getEventsByUsername(username: string): Promise<EventDto[]> {
    const events = await Event.findByUsername(username);
    return events.map((event) => event.toResponse());
  }

  async getEventById(eventId: string): Promise<EventDto | null> {
    const event = await Event.findById(eventId);
    return event ? event.toResponse() : null;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const eventExists = await Event.existsById(eventId);
    if (!eventExists) {
      throw createAppError(404, 'Event not found');
    }
    await Event.deleteById(eventId);
  }

  async updateEventImagePlaceholder(eventId: string, newKey: string | null): Promise<void> {
    const eventExists = await Event.existsById(eventId);
    if (!eventExists) {
      throw createAppError(404, 'Event not found');
    }
    await Event.updateImagePlaceholderObjectKey(eventId, newKey);
  }

  async updateSelectionAvailable(eventId: string, selectionAvailable: boolean): Promise<void> {
    const eventExists = await Event.existsById(eventId);
    if (!eventExists) {
      throw createAppError(404, 'Event not found');
    }
    await Event.updateSelectionAvailable(eventId, selectionAvailable);
  }

  async updateCamelGallery(eventId: string, camelGallery: boolean): Promise<void> {
    const eventExists = await Event.existsById(eventId);
    if (!eventExists) {
      throw createAppError(404, 'Event not found');
    }
    await Event.updateCamelGallery(eventId, camelGallery);
  }

  async updateToken(
    eventId: string,
    tokenId: string,
    tokenIdCreatedAt: string,
    tokenIdValidDays: string,
  ): Promise<void> {
    const eventExists = await Event.existsById(eventId);
    if (!eventExists) {
      throw createAppError(404, 'Event not found');
    }
    await Event.updateToken(eventId, tokenId, tokenIdCreatedAt, tokenIdValidDays);
  }
}
