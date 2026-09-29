import { Router } from 'express';
import { getAllUsers, searchUsers, updateStatus } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.put('/status', updateStatus);

export default router;
