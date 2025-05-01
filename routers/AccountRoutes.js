import express from 'express';
import { updateUserProfile, createCommunicationStyles, createCoreValues, createLoveLanguage, createTimePriorities, createUserAbout, createUserAccount, createUserAnger, createUserAttachment, createUserCareer, createUserCore, createUserEitherOr, createUserEmotions, createUserFuture, createUserLifestyle, createUserPhotos, createUserPreferences, createUserProfile, createUserPrompts, createUserTraits, editUserPhotos, uploadImage, updateUserAbout, updateUserCore } from '../controllers/AccountControllers.js';

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
router.post('/createCore', createUserCore);
router.post('/createEmotions', createUserEmotions);
router.post('/createAttachment', createUserAttachment);
router.post('/createLifestyle', createUserLifestyle);
router.post('/createFuture', createUserFuture);
router.post('/createAnger', createUserAnger);

router.put('/updatePhotos', editUserPhotos);
router.put('/updateProfile', updateUserProfile);
router.put('/updateAbout', updateUserAbout);
router.put('/updateCore', updateUserCore);
export default router;