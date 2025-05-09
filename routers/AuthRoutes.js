import { Router } from 'express';
import { checkSession, confirmPasswordReset, loginUser, logoutUser, verifyEmail } from '../controllers/AuthController.js';

const router = Router();

router.get('/session', checkSession);
router.post('/loginUser', loginUser);
router.post('/logoutUser', logoutUser);
router.post('/verifyEmail', verifyEmail);
router.post('/confirmPasswordReset', confirmPasswordReset);


export default router;
