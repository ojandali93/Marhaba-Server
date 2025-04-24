import express from 'express';
import { createUserAbout, createUserAccount, createUserCareer, createUserPreferences, createUserProfile, createUserTraits } from '../controllers/AccountControllers.js';

const router = express.Router();

router.post('/createAccount', createUserAccount); // Must match
router.post('/createProfile', createUserProfile);
router.post('/createAbout', createUserAbout);
router.post('/createCareer', createUserCareer);
router.post('/createTraits', createUserTraits);
router.post('/createPreferences', createUserPreferences);

export default router;