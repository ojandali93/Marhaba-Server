import { Router } from 'express';
import { upload } from '../middleware/multer.js';
import { createUserAccount, UploadToDatabase } from '../controllers/AccountControllers.js';

const router = Router();

router.post('/uploadImage', upload.single('image'), UploadToDatabase)
router.post('/createAccount', createUserAccount);

export default router;
