import { Router } from 'express';
import { generateProfilePrompt } from '../controllers/GenerateController.js';
const router = Router();

router.post('/user', generateProfilePrompt);
export default router;
