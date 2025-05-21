import { Router } from 'express';
import { grabEvents } from '../controllers/EventController.js';

const router = Router();

router.get('/', grabEvents);
export default router;
