import { Router } from 'express';
import { grabAllUsers, grabSingleProfile, likeProfile } from '../controllers/UserController.js';

const router = Router();

router.get('/:userId', grabSingleProfile);
router.get('/allUsers', grabAllUsers);
router.get('/likeUser', likeProfile);

export default router;
