import express from 'express';
import { approveProfile, grabAllAdmins, grabPendingProfiles, rejectProfile, reSubmitProfile, reviewInfo } from '../controllers/AdminControllers.js';

const router = express.Router();

router.get('/pendingProfiles', grabPendingProfiles);
router.post('/approveProfile', approveProfile);
router.post('/rejectProfile', rejectProfile);
router.put('/reSubmitProfile', reSubmitProfile);
router.get('/reviewInfo/:userId', reviewInfo);
router.get('/grabAllAdmin', grabAllAdmins);

export default router; 