import { FileDto } from './File';

export interface FileFacade {
  createFile(
    description: string,
    eventId: string,
    username: string,
    objectKey: string | null,
  ): Promise<FileDto>;
  getFilesByUsername(username: string): Promise<FileDto[]>;
}
