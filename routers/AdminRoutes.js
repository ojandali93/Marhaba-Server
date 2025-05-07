import express from 'express';
import { approveProfile, grabPendingProfiles, rejectProfile, reSubmitProfile, reviewInfo } from '../controllers/AdminControllers.js';

const router = express.Router();

router.get('/pendingProfiles', grabPendingProfiles);
router.post('/approveProfile', approveProfile);
router.post('/rejectProfile', rejectProfile);
router.put('/reSubmitProfile', reSubmitProfile);
router.get('/reviewInfo/:userId', reviewInfo);

export default router; 