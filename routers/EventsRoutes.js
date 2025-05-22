import { Router } from 'express';
import { createEventAttend, createEventPost, grabEventRsvp, grabEvents, grabFilteredEventPosts, grabSingleEvent } from '../controllers/EventController.js';

const router = Router();

router.post('/createEventPost', createEventPost);
router.post('/eventPosts', grabFilteredEventPosts);
router.post('/eventRsvp', grabEventRsvp);
router.post('/eventAttend', createEventAttend);
router.post('/createCheckin', createEventAttend);
router.get('/:eventId', grabSingleEvent);
router.get('/', grabEvents);
export default router;
