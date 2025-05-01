import { Router } from 'express';
import { approvedInteraction, CheckUserMatchStatus, getUserInteractions, grabAllUsers, grabSingleProfile, likeProfile, updateUserLocation } from '../controllers/UserController.js';

const router = Router();

router.get('/allUsers', grabAllUsers);
router.post('/interaction', likeProfile);
router.put('/approved', approvedInteraction);
router.get('/liked/:userId', getUserInteractions);
router.get('/matchStatus/:userId1/:userId2', CheckUserMatchStatus);
router.put('/location', updateUserLocation);
router.get('/:userId', grabSingleProfile);

export default router;
