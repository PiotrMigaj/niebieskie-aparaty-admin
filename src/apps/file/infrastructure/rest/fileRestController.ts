import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FileFacade } from '../../domain/FileFacade';
import { injectable, inject } from 'tsyringe';

interface CreateFileRequest {
  description: string;
  eventId: string;
  username: string;
  objectKey: string | null;
}

@injectable()
export class FileRestController {
  constructor(@inject('FileFacade') private readonly fileFacade: FileFacade) {}

  createFile = asyncHandler(async (req: Request, res: Response) => {
    const { description, eventId, username, objectKey } = req.body as CreateFileRequest;
    const fileDto = await this.fileFacade.createFile(description, eventId, username, objectKey);
    res.status(201).json({ fileDto });
  });
}
