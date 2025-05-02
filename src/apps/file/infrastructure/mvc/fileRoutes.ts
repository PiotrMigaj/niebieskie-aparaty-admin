import express from 'express';
import { FileController } from './fileController';
import ensureAdminSession from '../../../../middleware/adminAuthMiddleware';
import { container } from 'tsyringe';

const router = express.Router();
const fileController = container.resolve(FileController);

router.get(
  '/upload/:eventId',
  ensureAdminSession,
  fileController.showUploadForm.bind(fileController),
);

export default router;
