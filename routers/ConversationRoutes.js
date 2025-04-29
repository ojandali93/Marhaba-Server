import { Router } from 'express';
import { createConversation } from '../controllers/ConversationController.js';

const router = Router();

router.post('/create', createConversation);

export default router;
