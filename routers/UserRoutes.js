import { Router } from 'express';
import { grabAllUsers, grabSingleProfile, likeProfile } from '../controllers/UserController.js';

const router = Router();

router.get('/allUsers', grabAllUsers);
router.post('/interaction', likeProfile);
router.get('/:userId', grabSingleProfile);

export default router;
