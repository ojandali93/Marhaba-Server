import { Router } from 'express';
import { checkSession, loginUser, logoutUser } from '../controllers/AuthController.js';

const router = Router();

router.get('/session', checkSession);
router.post('/loginUser', loginUser);
router.post('/logoutUser', logoutUser);

export default router;
