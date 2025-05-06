import { Router } from 'express';
import { createConversation, getConversationmessages, getUnreadMessages, getUserConversations } from '../controllers/ConversationController.js';

const router = Router();

router.post('/create', createConversation);
router.get('/unread/:userId', getUnreadMessages);
router.get('/messages/:userId', getConversationmessages);
router.get('/:userId', getUserConversations);

export default router;
