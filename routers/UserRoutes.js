import { Router } from 'express';
import { getUserInteractions, grabAllUsers, grabSingleProfile, likeProfile } from '../controllers/UserController.js';

const router = Router();

router.get('/allUsers', grabAllUsers);
router.post('/interaction', likeProfile);
router.get('/liked/:userId', getUserInteractions);
router.get('/:userId', grabSingleProfile);

export default router;
