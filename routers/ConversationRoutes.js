import { Router } from 'express';
import { closeLayeredQuestions, createConversation, getConversationmessages, getLayeredQuestions, getUnreadMessages, getUserConversations, markMessagesAsRead, updateActive, updateConversationLastMessage, updateInactvie, updateLayeredQuestion } from '../controllers/ConversationController.js';

const router = Router();

router.post('/create', createConversation);
router.put('/read', markMessagesAsRead);
router.put('/lastMessage', updateConversationLastMessage);
router.post('/active', updateActive);
router.post('/inactive', updateInactvie);
router.get('/unread/:userId', getUnreadMessages);
router.get('/messages/:conversationId', getConversationmessages);
router.get('/:userId', getUserConversations);
router.post('/questions/update', updateLayeredQuestion);
router.post('/questions/close', closeLayeredQuestions);
router.get('/questions/:conversationId', getLayeredQuestions);

export default router;
