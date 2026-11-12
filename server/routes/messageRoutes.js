import { Router } from 'express';
import {
  getMessages,
  getThreadMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  togglePin,
  getPinnedMessages,
} from '../controllers/messageController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getMessages);
router.get('/pinned', getPinnedMessages);
router.get('/thread/:parentMessageId', getThreadMessages);
router.post('/', sendMessage);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/reactions', toggleReaction);
router.patch('/:messageId/pin', togglePin);

export default router;
