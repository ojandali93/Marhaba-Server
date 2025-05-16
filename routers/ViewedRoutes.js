import { Router } from 'express';
import { createViewed, getViewed, getViewedMe } from '../controllers/ViewedController.js';

const router = Router();

router.post('/create', createViewed);
router.get('/user/viewed/:viewer', getViewedMe);
router.get('/user/:viewer', getViewed);

export default router;
