import { Router } from 'express';
import { getUserConversations, getOrCreateConversation, markRead } from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getUserConversations);
router.post('/', getOrCreateConversation);
router.put('/:id/read', markRead);

export default router;
