import express from 'express';
import { createUserAccount } from '../controllers/AccountControllers.js';

const router = express.Router();

router.post('/createAccount', createUserAccount); // Must match

export default router;