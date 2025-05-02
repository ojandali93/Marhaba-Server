import { Router } from 'express';
import { createViewed, getViewed } from '../controllers/ViewedController.js';

const router = Router();

router.post('/create', createViewed);
router.get('/:userId', getViewed);

export default router;
