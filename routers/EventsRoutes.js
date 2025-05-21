import { Router } from 'express';
import { approvedInteraction, updateViewed, CheckUserMatchStatus, filterProfiles, getUserInteractions, getWeeklyInteractionStats, grabAllUsers, grabSingleProfile, likeProfile, updateInteraction, updateNotifications, updateUserLocation, updateUserTutorial, updateVisibility, getMatches, sendResetPasswordEmail, removeInteraction, deleteUserAccount, updateSocials } from '../controllers/UserController.js';
import { blockUser, getBlockedUsers, reportUser, unblockUser } from '../controllers/AdminControllers.js';
import { updateShowBadge } from '../controllers/ConversationController.js';

const router = Router();

router.get('/', sendResetPasswordEmail);
export default router;
