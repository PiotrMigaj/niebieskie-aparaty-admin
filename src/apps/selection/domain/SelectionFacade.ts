import { SelectionDto } from './Selection';

export interface SelectionFacade {
  createSelection(
    eventId: string,
    eventTitle: string,
    maxNumberOfPhotos: number,
    username: string,
  ): Promise<SelectionDto>;
  getSelectionByEventId(eventId: string): Promise<SelectionDto | null>;
  getSelectionsByUsername(username: string): Promise<SelectionDto[]>;
  getSelectionById(selectionId: string): Promise<SelectionDto | null>;
  selectionExistsForEvent(eventId: string): Promise<boolean>;
  deleteSelection(selectionId: string): Promise<void>;
  updateSelectedImages(selectionId: string, selectedImages: string[]): Promise<void>;
  updateBlocked(selectionId: string, blocked: boolean): Promise<void>;
}