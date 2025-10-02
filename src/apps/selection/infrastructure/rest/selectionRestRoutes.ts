import express from 'express';
import { SelectionRestController } from './selectionRestController';
import { container } from 'tsyringe';
import ensureAdminSession from '../../../../middleware/adminAuthMiddleware';

const router = express.Router();

// Resolve controller with proper error handling
let selectionRestController: SelectionRestController;
try {
  selectionRestController = container.resolve(SelectionRestController);
} catch (error) {
  console.error('Failed to resolve SelectionRestController:', error);
  throw error;
}

/**
 * @swagger
 * /api/selections/{selectionId}/toggle-blocked:
 *   patch:
 *     summary: Toggle selection blocked status
 *     description: Toggle the blocked status of a specific selection.
 *     tags: [Selections]
 *     parameters:
 *       - in: path
 *         name: selectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The selection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blocked
 *             properties:
 *               blocked:
 *                 type: boolean
 *                 description: Whether the selection should be blocked or not
 *     responses:
 *       200:
 *         description: Selection blocked status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 blocked:
 *                   type: boolean
 *       400:
 *         description: Bad request - invalid input
 *       404:
 *         description: Selection not found
 *       500:
 *         description: Server error
 */

// PATCH /api/selections/:selectionId/toggle-blocked - Toggle selection blocked status
router.patch(
  '/:selectionId/toggle-blocked',
  ensureAdminSession,
  selectionRestController.toggleBlocked.bind(selectionRestController),
);

export default router;