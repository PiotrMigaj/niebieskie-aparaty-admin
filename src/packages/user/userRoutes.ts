import express from 'express';
import { generatePassword, createUser, getAllUsers } from './userController';
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: This endpoint creates a new user after validating the username.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # JWT token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 description: The email of the user.
 *                 example: john_doe@gmail.com
 *               fullName:
 *                 type: string
 *                 description: The full name of the user.
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: Aq2vzBsv
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: john_doe
 *                 email:
 *                   type: string
 *                   example: john_doe@gmail.com
 *                 fullName:
 *                   type: string
 *                   example: John Doe
 *                 role:
 *                   type: string
 *                   example: USER
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 active:
 *                   type: boolean
 *       401:
 *         description: Unauthorized, invalid token
 *       409:
 *         description: Conflict, username already exists
 */
router.post('', authenticate, createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all registered users (excluding passwords).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # JWT token authentication
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         example: john_doe
 *                       email:
 *                         type: string
 *                         example: john_doe@gmail.com
 *                       fullName:
 *                         type: string
 *                         example: John Doe
 *                       role:
 *                         type: string
 *                         example: USER
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       active:
 *                         type: boolean
 *       401:
 *         description: Unauthorized, invalid token
 */
router.get('', authenticate, getAllUsers);

/**
 * @swagger
 * /api/users/generatePassword:
 *   get:
 *     summary: Generate a secure password
 *     description: Generate a secure password with a length specified by the query parameter. Minimum length is 6. Defaults to 8 if not provided.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []  # JWT token authentication
 *     parameters:
 *       - in: query
 *         name: length
 *         description: The length of the generated password
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 6
 *           default: 8
 *     responses:
 *       200:
 *         description: Successfully generated password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 password:
 *                   type: string
 *                   description: The generated secure password
 *       401:
 *         description: Unauthorized. Invalid or missing JWT token
 *       500:
 *         description: Internal server error
 */
router.get('/generatePassword', authenticate, generatePassword);

export default router;
