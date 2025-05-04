import { Router } from 'express';
import { approvedInteraction, CheckUserMatchStatus, getUserInteractions, getWeeklyInteractionStats, grabAllUsers, grabSingleProfile, likeProfile, updateInteraction, updateUserLocation, updateUserTutorial } from '../controllers/UserController.js';

const router = Router();

router.get('/allUsers', grabAllUsers);
router.post('/interaction', likeProfile);
router.put('/approved', approvedInteraction);
router.put('/location', updateUserLocation);
router.put('/tutorial', updateUserTutorial);
router.put('/updateInteraction', updateInteraction);
router.get('/liked/:userId', getUserInteractions);
router.get('/weeklyStats/:userId', getWeeklyInteractionStats);
router.get('/matchStatus/:userId1/:userId2', CheckUserMatchStatus);
router.get('/:userId', grabSingleProfile);
export default router;
