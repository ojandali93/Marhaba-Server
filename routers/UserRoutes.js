import { Router } from 'express';
import { approvedInteraction, updateViewed, CheckUserMatchStatus, filterProfiles, getUserInteractions, getWeeklyInteractionStats, grabAllUsers, grabSingleProfile, likeProfile, updateInteraction, updateNotifications, updateUserLocation, updateUserTutorial, updateVisibility, getMatches, sendResetPasswordEmail } from '../controllers/UserController.js';
import { blockUser, getBlockedUsers, reportUser, unblockUser } from '../controllers/AdminControllers.js';

const router = Router();

router.post('/requestResetPassword', sendResetPasswordEmail);
router.get('/allUsers', grabAllUsers);
router.post('/getMatches', getMatches);
router.post('/interaction', likeProfile);
router.put('/approved', approvedInteraction);
router.put('/location', updateUserLocation);
router.put('/tutorial', updateUserTutorial);
router.put('/updateInteraction', updateInteraction);
router.post('/filterProfiles', filterProfiles);
router.put('/updateNotifications', updateNotifications);
router.put('/updateVisibility', updateVisibility);
router.put('/updateViewed', updateViewed);
router.post('/blockUser', blockUser);
router.post('/unblockUser', unblockUser);
router.post('/reportUser', reportUser);
router.get('/liked/:userId', getUserInteractions);
router.get('/weeklyStats/:userId', getWeeklyInteractionStats);
router.get('/blockedUsers/:userId', getBlockedUsers);
router.get('/matchStatus/:userId1/:userId2', CheckUserMatchStatus);
router.get('/:userId', grabSingleProfile);
export default router;
