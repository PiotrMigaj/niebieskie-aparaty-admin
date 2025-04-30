import express from 'express';
import { EventRestController } from './eventRestController';
import { authenticate } from '../../../../middleware/authMiddleware';
import { container } from 'tsyringe';

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
  authenticate,
  eventRestController.updateEventImagePlaceholder.bind(eventRestController),
);

export default router;
