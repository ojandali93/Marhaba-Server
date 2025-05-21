import { Router } from 'express';
import { createEventPost, grabEvents, grabSingleEvent } from '../controllers/EventController.js';

const router = Router();

router.post('/createEventPost', createEventPost);
router.get('/:eventId', grabSingleEvent);
router.get('/', grabEvents);
export default router;
