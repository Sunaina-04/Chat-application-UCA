import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import groupRoutes from './groupRoutes.js';
import roomRoutes from './roomRoutes.js';
import messageRoutes from './messageRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/groups', groupRoutes);
router.use('/rooms', roomRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ChatSpace Backend API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
