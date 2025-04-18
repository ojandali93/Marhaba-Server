import { Router } from 'express';
import { createUser } from '../controllers/UserControllers.js'; // ✅ match the folder name

const router = Router();

// POST /api/users
router.post('/', createUser);

export default router;