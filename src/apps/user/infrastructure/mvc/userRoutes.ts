import express from 'express';
import { UserController } from './userController';
import ensureAdminSession from '../../../../middleware/adminAuthMiddleware';
import { container } from 'tsyringe';

const router = express.Router();
const userController = container.resolve(UserController);

router.get('', ensureAdminSession, userController.listUsers.bind(userController));
router.get('/create', ensureAdminSession, userController.showCreateForm.bind(userController));
router.post('/create', ensureAdminSession, userController.createUser.bind(userController));

export default router;
