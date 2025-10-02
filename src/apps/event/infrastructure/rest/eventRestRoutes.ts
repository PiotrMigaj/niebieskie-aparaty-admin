import express from 'express';
import { EventRestController } from './eventRestController';
import { authenticate } from '../../../../middleware/authMiddleware';
import { container } from 'tsyringe';
import { ensureAuthenticated } from '../../../../middleware/ensureAuthenticated';

const router = express.Router();
const eventRestController = container.resolve(EventRestController);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     description: This endpoint creates a new event after validating the username and allowing for an optional image placeholder object key.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
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
 *                 description: Object key of the image placeholder for the event.
 *                 example: "event_images/wedding_placeholder.jpg"
 *     responses:
 *       201:
 *         description: Event successfully created
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('', authenticate, eventRestController.createEvent.bind(eventRestController));

/**
 * @swagger
 * /api/events/{username}:
 *   get:
 *     summary: Get all events for a user
 *     description: Retrieve all events for a specific username with their associated files.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events with files
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  '/:username',
  authenticate,
  eventRestController.getEventsByUsername.bind(eventRestController),
);

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event details
 *     description: Get details of a specific event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get('/:eventId', authenticate, eventRestController.getEventById.bind(eventRestController));

/**
 * @swagger
 * /api/events/{eventId}:
 *   put:
 *     summary: Update event image placeholder
 *     description: Update the image placeholder for a specific event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imagePlaceholderObjectKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.put(
  '/:eventId',
  ensureAuthenticated,
  eventRestController.updateEventImagePlaceholder.bind(eventRestController),
);

/**
 * @swagger
 * /api/events/upload-url:
 *   post:
 *     summary: Generate presigned URL for image upload
 *     description: Generate a presigned URL for uploading an event image to S3.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: The name of the file to upload
 *               contentType:
 *                 type: string
 *                 description: The MIME type of the file
 *               username:
 *                 type: string
 *                 description: The username associated with the event
 *               eventId:
 *                 type: string
 *                 description: The ID of the event
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to generate upload URL
 */
router.post(
  '/upload-url',
  ensureAuthenticated,
  eventRestController.generateUploadUrl.bind(eventRestController),
);

/**
 * @swagger
 * /api/events/{eventId}/toggle-selection:
 *   patch:
 *     summary: Toggle event selection availability
 *     description: Toggle the availability of selection for a specific event.
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectionAvailable:
 *                 type: boolean
 *                 description: Whether selection is available for this event
 *     responses:
 *       200:
 *         description: Selection availability updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:eventId/toggle-selection',
  ensureAuthenticated,
  eventRestController.toggleSelectionAvailable.bind(eventRestController),
);

export default router;
