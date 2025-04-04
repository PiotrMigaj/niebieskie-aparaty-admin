import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../user/User';
import { Event } from './Event';
import { File } from '../file/File';
import { createAppError } from '../../middleware/errorMiddleware';

interface CreateEventRequest {
  date: string;
  description: string;
  title: string;
  username: string;
  imagePlaceholderObjectKey: string | null;
}

// @desc    Create new event
// @route   POST /api/events
// @access  Private (JWT protected)
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { date, description, title, username, imagePlaceholderObjectKey } =
    req.body as CreateEventRequest;
  const userExists = await User.existsByUsername(username);
  if (!userExists) {
    throw createAppError(404, 'User with such username does not exist');
  }
  const event = new Event(date, description, title, username, imagePlaceholderObjectKey);
  const savedEvent = await event.save();
  const eventDto = savedEvent.toResponse();
  res.status(201).json({ eventDto });
});

// @desc    Get all events for a specific username, with nested files
// @route   GET /api/events/:username
// @access  Private (JWT protected)
export const getEventsByUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const userExists = await User.existsByUsername(username);
  if (!userExists) {
    throw createAppError(404, 'User with such username does not exist');
  }
  const events = await Event.findByUsername(username);
  const files = await File.findByUsername(username);
  const eventsDto = events.map((event) => {
    const eventFiles = files.filter((file) => file.getEventId() === event.getEventId());
    const filesDto = eventFiles.map((file) => file.toResponse());
    return {
      ...event.toResponse(),
      filesDto: filesDto,
    };
  });
  res.status(200).json({ eventsDto });
});
