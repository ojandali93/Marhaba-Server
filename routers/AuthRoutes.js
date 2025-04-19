import { Router } from 'express';
import { checkSession } from '../controllers/AuthController.js';

const router = Router();

router.get('/session', checkSession);

export default router;
