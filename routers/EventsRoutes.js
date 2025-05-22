import { Router } from 'express';
import { createEventCheckin, createEventPost, grabEventAttend, grabEventRsvp, grabEvents, grabFilteredEventPosts, grabSingleEvent } from '../controllers/EventController.js';

const router = Router();

router.post('/createEventPost', createEventPost);
router.post('/eventPosts', grabFilteredEventPosts);
router.post('/eventRsvp', grabEventRsvp);
router.post('/eventAttend', grabEventAttend);
router.post('/createCheckin', createEventCheckin);
router.get('/:eventId', grabSingleEvent);
router.get('/', grabEvents);
export default router;
