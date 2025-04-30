import express from 'express';
import { EventController } from './eventController';
import ensureAdminSession from '../../../../middleware/adminAuthMiddleware';
import { container } from 'tsyringe';

const router = express.Router();
const eventController = container.resolve(EventController);

router.get('/:eventId', ensureAdminSession, eventController.getEventDetails.bind(eventController));

export default router;
