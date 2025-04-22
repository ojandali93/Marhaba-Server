import { Router } from 'express';
import { UploadToDatabase } from '../controllers/AccountControllers.js';

const router = Router();

router.get('/uploadImage', UploadToDatabase);

export default router;
