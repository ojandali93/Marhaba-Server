import { Router } from 'express';
import { checkSession, loginUser } from '../controllers/AuthController.js';

const router = Router();

router.get('/session', checkSession);
router.get('/loginUser', loginUser);

export default router;
