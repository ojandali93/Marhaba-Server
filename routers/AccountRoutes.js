import express from 'express';
import { updateUserProfile, createCommunicationStyles, createCoreValues, createLoveLanguage, createTimePriorities, createUserAbout, createUserAccount, createUserAnger, createUserAttachment, createUserCareer, createUserCore, createUserEitherOr, createUserEmotions, createUserFuture, createUserLifestyle, createUserPhotos, createUserPreferences, createUserProfile, createUserPrompts, createUserTraits, editUserPhotos, uploadImage, updateUserAbout, updateUserCore, updateuserLifestyle, updateUserFuture, updateUserCareer, updateUserPrompts, updateUserTags, updateSurvey, createNotifications, checkUserEmail, createIntent, createHabits } from '../controllers/AccountControllers.js';

const router = express.Router();

router.post('/createAccount', createUserAccount); // Must match
router.post('/createProfile', createUserProfile);
router.post('/createAbout', createUserAbout);
router.post('/createCareer', createUserCareer);
router.post('/createTraits', createUserTraits);
router.post('/createIntent', createIntent);
router.post('/createHabits', createHabits);
router.post('/createPreferences', createUserPreferences);
router.post('/createSurvey', createUserEitherOr);
router.post('/createPrompts', createUserPrompts);
router.post('/createPhotos', createUserPhotos);
router.get('/checkEmail/:email', checkUserEmail);

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
router.post('/createNotifications', createNotifications);

router.put('/updatePhotos', editUserPhotos);
router.put('/updateProfile', updateUserProfile);
router.put('/updateAbout', updateUserAbout);
router.put('/updateCore', updateUserCore);
router.put('/updateLifestyle', updateuserLifestyle);
router.put('/updateFuture', updateUserFuture);
router.put('/updateCareer', updateUserCareer);
router.put('/updatePrompts', updateUserPrompts);
router.put('/updateTags', updateUserTags);
router.put('/updateSurvey', updateSurvey);

export default router;