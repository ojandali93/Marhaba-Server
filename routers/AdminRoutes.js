import express from 'express';
import { grabPendingProfiles } from '../controllers/AdminControllers.js';

const router = express.Router();

router.get('/pendingProfiles', grabPendingProfiles);

export default router;