import express from 'express';
import { approveProfile, grabPendingProfiles, rejectProfile } from '../controllers/AdminControllers.js';

const router = express.Router();

router.get('/pendingProfiles', grabPendingProfiles);
router.post('/approveProfile', approveProfile);
router.post('/rejectProfile', rejectProfile);

export default router;