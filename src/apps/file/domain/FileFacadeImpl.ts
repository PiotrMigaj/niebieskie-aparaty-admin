import { injectable } from 'tsyringe';
import { File, FileDto } from './File';
import { FileFacade } from './FileFacade';
import { User } from '../../user/domain/User';
import { Event } from '../../event/domain/Event';
import { createAppError } from '../../../middleware/errorMiddleware';

@injectable()
export class FileFacadeImpl implements FileFacade {
  async createFile(
    description: string,
    eventId: string,
    username: string,
    objectKey: string | null = null,
  ): Promise<FileDto> {
    const userExists = await User.existsByUsername(username);
    if (!userExists) {
      throw createAppError(404, 'User with such username does not exist');
    }
    const eventExists = await Event.existsById(eventId);
    if (!eventExists) {
      throw createAppError(404, 'Event with such eventId does not exist');
    }
    const file = new File(description, eventId, username, objectKey);
    const savedFile = await file.save();
    return savedFile.toResponse();
  }

  async getFilesByUsername(username: string): Promise<FileDto[]> {
    const files = await File.findByUsername(username);
    return files.map((file) => file.toResponse());
  }
}
