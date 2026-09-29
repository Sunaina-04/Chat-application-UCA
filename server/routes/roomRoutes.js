import { Router } from 'express';
import { getRoomsByGroup, createRoom, deleteRoom } from '../controllers/roomController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/group/:groupId', getRoomsByGroup);
router.post('/group/:groupId', createRoom);
router.delete('/:roomId/group/:groupId', deleteRoom);

export default router;
