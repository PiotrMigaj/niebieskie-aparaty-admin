import express from "express";
import { createFile } from "./fileController";
import { authenticate } from "../../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: Upload a new file
 *     description: This endpoint uploads a new file, creating an entry in the Files table.
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []  # JWT token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: A brief description of the file.
 *                 example: "Wedding of John Doe"
 *               eventId:
 *                 type: string
 *                 description: The ID of the associated event for the file.
 *                 example: "a1b2c3d4-e5f6-7890-abcd-efghijklmnop"
 *               username:
 *                 type: string
 *                 description: The username of the user uploading the file.
 *                 example: "john_doe"
 *               objectKey:
 *                 type: string
 *                 description: The object key of the file stored in S3 or another storage.
 *                 example: "event_images/wedding_photos.zip"
 *     responses:
 *       201:
 *         description: File successfully uploaded and entry created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileId:
 *                   type: string
 *                   description: The unique identifier for the file.
 *                   example: "a1b2c3d4-e5f6-7890-abcd-efghijklmnop"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp when the file entry was created.
 *                 description:
 *                   type: string
 *                   description: The description of the file.
 *                   example: "Wedding of John Doe"
 *                 eventId:
 *                   type: string
 *                   description: The ID of the associated event.
 *                   example: "a1b2c3d4-e5f6-7890-abcd-efghijklmnop"
 *                 username:
 *                   type: string
 *                   description: The username of the user who uploaded the file.
 *                   example: "john_doe"
 *                 objectKey:
 *                   type: string
 *                   description: The object key of the file in storage.
 *                   example: "event_images/wedding_photos.zip"
 *                 dateOfLastDownload:
 *                   type: string
 *                   format: date-time
 *                   description: The last time the file was downloaded (empty by default).
 *       401:
 *         description: Unauthorized, invalid token
 *       404:
 *         description: Not found, event with such eventId does not exist
 */
router.post("", authenticate, createFile);

export default router;