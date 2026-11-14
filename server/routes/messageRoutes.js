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
  createPollMessage,
  votePoll,
  closePoll,
} from '../controllers/messageController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getMessages);
router.get('/pinned', getPinnedMessages);
router.get('/thread/:parentMessageId', getThreadMessages);
router.post('/', sendMessage);
router.post('/poll', createPollMessage);
router.post('/:messageId/poll/vote', votePoll);
router.post('/:messageId/poll/close', closePoll);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/reactions', toggleReaction);
router.patch('/:messageId/pin', togglePin);

export default router;
