import { Router } from 'express';
import { checkSession, loginUser, logoutUser, verifyEmail } from '../controllers/AuthController.js';

const router = Router();

router.get('/session', checkSession);
router.post('/loginUser', loginUser);
router.post('/logoutUser', logoutUser);
router.post('/verifyEmail', verifyEmail);

export default router;
