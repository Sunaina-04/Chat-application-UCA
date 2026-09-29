import { Router } from 'express';
import { getNotifications, markRead, markAllRead, globalSearch } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getNotifications);
router.put('/:notifId/read', markRead);
router.put('/read-all', markAllRead);
router.get('/search/global', globalSearch);

export default router;
