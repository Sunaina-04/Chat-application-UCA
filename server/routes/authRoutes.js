import { Router } from 'express';
import { register, login, demoLogin, getDemoUsers, getMe, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/demo-users', getDemoUsers);
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

export default router;
