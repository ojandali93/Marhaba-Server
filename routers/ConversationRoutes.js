import { Router } from 'express';
import { createConversation, getUserConversations } from '../controllers/ConversationController.js';

const router = Router();

router.post('/create', createConversation);
router.get('/:userId', getUserConversations);

export default router;
