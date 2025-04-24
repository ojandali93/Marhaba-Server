import express from 'express';
import { createUserAbout, createUserAccount, createUserProfile } from '../controllers/AccountControllers.js';

const router = express.Router();

router.post('/createAccount', createUserAccount); // Must match
router.post('/createProfile', createUserProfile);
router.post('/createAbout', createUserAbout);

export default router;