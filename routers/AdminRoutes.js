import express from 'express';
import { approveProfile, grabPendingProfiles, rejectProfile, reviewInfo } from '../controllers/AdminControllers.js';

const router = express.Router();

router.get('/pendingProfiles', grabPendingProfiles);
router.post('/approveProfile', approveProfile);
router.post('/rejectProfile', rejectProfile);
router.post('/reviewInfo', reviewInfo);

export default router; 