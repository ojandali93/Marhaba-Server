import { Router } from 'express';
import { createEventPost, grabEvents, grabFilteredEventPosts, grabSingleEvent } from '../controllers/EventController.js';

const router = Router();

router.post('/createEventPost', createEventPost);
router.post('/eventPosts', grabFilteredEventPosts);
router.get('/:eventId', grabSingleEvent);
router.get('/', grabEvents);
export default router;
