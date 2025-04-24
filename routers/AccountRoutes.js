import express from 'express';
import { createUserAbout, createUserAccount, createUserCareer, createUserEitherOr, createUserPreferences, createUserProfile, createUserPrompts, createUserTraits } from '../controllers/AccountControllers.js';

const router = express.Router();

router.post('/createAccount', createUserAccount); // Must match
router.post('/createProfile', createUserProfile);
router.post('/createAbout', createUserAbout);
router.post('/createCareer', createUserCareer);
router.post('/createTraits', createUserTraits);
router.post('/createPreferences', createUserPreferences);
router.post('/createSurvey', createUserEitherOr);
router.post('/createPrompts', createUserPrompts);

export default router;