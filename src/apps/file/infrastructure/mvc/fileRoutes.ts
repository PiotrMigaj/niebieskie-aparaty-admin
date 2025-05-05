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

router.get(
  '/upload-large/:eventId',
  ensureAdminSession,
  fileController.showLargeFileUploadForm.bind(fileController),
);

export default router;
