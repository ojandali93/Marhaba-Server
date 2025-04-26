import express from 'express';
import { createCommunicationStyles, createCoreValues, createLoveLanguage, createTimePriorities, createUserAbout, createUserAccount, createUserCareer, createUserEitherOr, createUserPhotos, createUserPreferences, createUserProfile, createUserPrompts, createUserTraits, uploadImage, uploadImageToSupabase } from '../controllers/AccountControllers.js';

const router = express.Router();

router.post('/createAccount', createUserAccount); // Must match
router.post('/createProfile', createUserProfile);
router.post('/createAbout', createUserAbout);
router.post('/createCareer', createUserCareer);
router.post('/createTraits', createUserTraits);
router.post('/createPreferences', createUserPreferences);
router.post('/createSurvey', createUserEitherOr);
router.post('/createPrompts', createUserPrompts);
router.post('/createPhotos', createUserPhotos);

router.post('/createCommunication', createCommunicationStyles);
router.post('/createLove', createLoveLanguage);
router.post('/createTime', createTimePriorities);
router.post('/createValues', createCoreValues);
router.post('/upoadImage', uploadImage);

export default router;