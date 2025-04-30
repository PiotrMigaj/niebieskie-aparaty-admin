import express from 'express';
import { generatePresignedUrl, renderUploadPage } from './uploadController';
import ensureAdminSession from '../../middleware/adminAuthMiddleware';

const router = express.Router();

router.post('/presigned-url', ensureAdminSession, generatePresignedUrl);

router.get('/', ensureAdminSession, renderUploadPage);

export default router;
