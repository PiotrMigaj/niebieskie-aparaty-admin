import express from 'express';
import { UserController } from './userController';
import ensureAdminSession from '../../../../middleware/adminAuthMiddleware';
import { container } from 'tsyringe';

const router = express.Router();
const userController = container.resolve(UserController);

router.get('', ensureAdminSession, userController.listUsers.bind(userController));
router.get('/create', ensureAdminSession, userController.showCreateForm.bind(userController));
router.post('/create', ensureAdminSession, userController.createUser.bind(userController));
router.get('/:username', ensureAdminSession, userController.getUserDetails.bind(userController));
router.post(
  '/:username/delete',
  ensureAdminSession,
  userController.deleteUser.bind(userController),
);
router.get(
  '/:username/events/create',
  ensureAdminSession,
  userController.showCreateEventForm.bind(userController),
);
router.post(
  '/:username/events',
  ensureAdminSession,
  userController.createEvent.bind(userController),
);

export default router;
