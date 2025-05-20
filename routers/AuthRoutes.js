import { Router } from 'express';
import { checkSession, confirmPasswordReset, loginUser, logoutUser, verifyAndUpdatePassword, verifyEmail } from '../controllers/AuthController.js';

const router = Router();

router.get('/session', checkSession);
router.post('/loginUser', loginUser);
router.post('/logoutUser', logoutUser);
router.post('/verifyEmail', verifyEmail);
router.post('/confirmPasswordReset', confirmPasswordReset);
router.post('/updatePassword', verifyAndUpdatePassword);


export default router;
