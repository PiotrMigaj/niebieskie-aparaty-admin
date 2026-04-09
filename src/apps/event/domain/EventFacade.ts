import { EventDto } from './Event';

export interface EventFacade {
  createEvent(
    date: string,
    description: string,
    title: string,
    username: string,
    imagePlaceholderObjectKey?: string | null,
  ): Promise<EventDto>;
  getEventsByUsername(username: string): Promise<EventDto[]>;
  getEventById(eventId: string): Promise<EventDto | null>;
  deleteEvent(eventId: string): Promise<void>;
  updateEventImagePlaceholder(eventId: string, newKey: string | null): Promise<void>;
  updateSelectionAvailable(eventId: string, selectionAvailable: boolean): Promise<void>;
  updateCamelGallery(eventId: string, camelGallery: boolean): Promise<void>;
  updateToken(
    eventId: string,
    tokenId: string,
    tokenIdCreatedAt: string,
    tokenIdValidDays: string,
  ): Promise<void>;
}
