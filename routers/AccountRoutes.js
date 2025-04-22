import { Router } from 'express';
import { upload } from '../middleware/multer.js';
import { UploadToDatabase } from '../controllers/AccountControllers.js';

const router = Router();

router.post('/uploadImage', upload.single('image'), UploadToDatabase);

export default router;
