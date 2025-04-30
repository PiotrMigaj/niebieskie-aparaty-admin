import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../user/domain/User';
import { Event } from '../event/Event';
import { createAppError } from '../../middleware/errorMiddleware';
import { File } from './File';

interface CreateFileRequest {
  description: string;
  eventId: string;
  username: string;
  objectKey: string | null;
}

// @desc    Create new file
// @route   POST /api/files
// @access  Private (JWT protected)
export const createFile = asyncHandler(async (req: Request, res: Response) => {
  const { description, eventId, username, objectKey } = req.body as CreateFileRequest;
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
  const fileDto = savedFile.toResponse();
  res.status(201).json({ fileDto });
});
