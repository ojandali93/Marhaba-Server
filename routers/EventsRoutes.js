import { Router } from 'express';
import { grabEvents, grabSingleEvent } from '../controllers/EventController.js';

const router = Router();

router.get('/', grabEvents);
router.get('/:eventId', grabSingleEvent);
export default router;
