import { Router } from 'express';
import { grabEvents } from '../controllers/EventController';

const router = Router();

router.get('/', grabEvents);
export default router;
