import { Router } from 'express';
import { createViewed, getViewed } from '../controllers/ViewedController.js';

const router = Router();

router.post('/create', createViewed);
router.get('/user/:viewer', getViewed);

export default router;
