import { Router } from 'express';
import { grabAllUsers, grabSingleProfile } from '../controllers/UserController.js';

const router = Router();

router.get('/:userId', grabSingleProfile);
router.get('/allUsers', grabAllUsers);

export default router;
