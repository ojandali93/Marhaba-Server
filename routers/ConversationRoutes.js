import { Router } from 'express';
import { createConversation, getConversationmessages, getUserConversations } from '../controllers/ConversationController.js';

const router = Router();

router.post('/create', createConversation);
router.get('/messages/:conversationId', getConversationmessages);
router.get('/:userId', getUserConversations);

export default router;
