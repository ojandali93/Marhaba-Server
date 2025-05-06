import { Router } from 'express';
import { createConversation, getConversationmessages, getUnreadMessages, getUserConversations, markMessagesAsRead } from '../controllers/ConversationController.js';

const router = Router();

router.post('/create', createConversation);
router.put('/read', markMessagesAsRead);
router.get('/unread/:userId', getUnreadMessages);
router.get('/messages/:conversationId', getConversationmessages);
router.get('/:userId', getUserConversations);

export default router;
