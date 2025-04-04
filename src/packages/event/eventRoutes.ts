import express from 'express';
import { createEvent, getEventsByUsername } from './eventController';
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     description: This endpoint creates a new event after validating the username and allowing for an optional image placeholder object key.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []  # JWT token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: The date of the event in format YYYY-MM-DD.
 *                 example: "2025-04-30"
 *               description:
 *                 type: string
 *                 description: A brief description of the event.
 *                 example: "Wedding reception celebration"
 *               title:
 *                 type: string
 *                 description: The title of the event.
 *                 example: "John and Jane's Wedding"
 *               username:
 *                 type: string
 *                 description: The username of the user creating the event.
 *                 example: "john_doe"
 *               imagePlaceholderObjectKey:
 *                 type: string
 *                 description: Object key of the image placeholder for the event. This is an optional field.
 *                 example: "event_images/wedding_placeholder.jpg"
 *     responses:
 *       201:
 *         description: Event successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventId:
 *                   type: string
 *                   description: Unique identifier of the created event.
 *                   example: "a1b2c3d4-e5f6-7890-abcd-efghijklmnop"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp when the event was created.
 *                   example: "2025-04-15T10:30:00Z"
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: The date of the event.
 *                   example: "2025-04-30"
 *                 description:
 *                   type: string
 *                   description: The description of the event.
 *                   example: "Wedding reception celebration"
 *                 title:
 *                   type: string
 *                   description: The title of the event.
 *                   example: "John and Jane's Wedding"
 *                 username:
 *                   type: string
 *                   description: The username of the user who created the event.
 *                   example: "john_doe"
 *                 imagePlaceholderObjectKey:
 *                   type: string
 *                   description: Object key of the image placeholder for the event.
 *                   example: "event_images/wedding_placeholder.jpg"
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: Not found, user with such username does not exist
 */
router.post('', authenticate, createEvent);

/**
 * @swagger
 * /api/events/{username}:
 *   get:
 *     summary: Get all events with corresponding files for a specific username
 *     description: This endpoint retrieves all events associated with the given username, with a nested list of files for each event.
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user whose events are to be fetched.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []  # JWT token authentication
 *     responses:
 *       200:
 *         description: List of events for the user, with corresponding files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventsDto:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventId:
 *                         type: string
 *                         description: The unique identifier for the event.
 *                         example: "a1b2c3d4-e5f6-7890-abcd-efghijklmnop"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the event.
 *                       date:
 *                         type: string
 *                         description: The date of the event (YYYY-MM-DD).
 *                         example: "2025-02-04"
 *                       description:
 *                         type: string
 *                         description: The description of the event.
 *                         example: "Wedding reception celebration"
 *                       title:
 *                         type: string
 *                         description: The title of the event.
 *                         example: "John and Jane's Wedding"
 *                       username:
 *                         type: string
 *                         description: The username of the event creator.
 *                         example: "john_doe"
 *                       filesDto:
 *                         type: array
 *                         description: List of files associated with the event
 *                         items:
 *                           type: object
 *                           properties:
 *                             fileId:
 *                               type: string
 *                               description: The unique identifier for the file.
 *                               example: "file12345"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               description: The creation date of the file.
 *                             description:
 *                               type: string
 *                               description: The description of the file.
 *                               example: "Event photo"
 *                             eventId:
 *                               type: string
 *                               description: The event ID this file belongs to.
 *                               example: "a1b2c3d4-e5f6-7890-abcd-efghijklmnop"
 *                             username:
 *                               type: string
 *                               description: The username of the file owner.
 *                               example: "john_doe"
 *                             objectKey:
 *                               type: string
 *                               description: The object key where the file is stored.
 *                               example: "images/photo1.jpg"
 *                             dateOfLastDownload:
 *                               type: string
 *                               format: date-time
 *                               description: The date the file was last downloaded.
 *                               example: "2025-04-05T10:00:00.000Z"
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized, invalid token
 */
router.get('/:username', authenticate, getEventsByUsername);

export default router;
