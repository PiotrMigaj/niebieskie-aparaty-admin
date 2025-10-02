import express from 'express';
import { SelectionController } from './selectionController';
import { container } from 'tsyringe';
import ensureAdminSession from '../../../../middleware/adminAuthMiddleware';

const router = express.Router();

// Resolve controller with proper error handling
let selectionController: SelectionController;
try {
  selectionController = container.resolve(SelectionController);
} catch (error) {
  console.error('Failed to resolve SelectionController:', error);
  throw error;
}

// GET /selection/create-selection - Show create selection form
router.get(
  '/create-selection',
  ensureAdminSession,
  selectionController.createSelectionPage.bind(selectionController),
);

// POST /selection/create-selection - Submit selection creation form
router.post(
  '/create-selection',
  ensureAdminSession,
  selectionController.createSelection.bind(selectionController),
);

// GET /selection/details/:eventId - Show selection details for an event
router.get(
  '/details/:eventId',
  ensureAdminSession,
  selectionController.selectionDetails.bind(selectionController),
);

export default router;