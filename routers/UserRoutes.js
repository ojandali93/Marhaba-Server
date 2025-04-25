import { Router } from 'express';
import { grabSingleProfile } from '../controllers/UserController.js';

const router = Router();

router.get('/:userId', grabSingleProfile);

export default router;
