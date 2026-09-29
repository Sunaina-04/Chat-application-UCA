import { Router } from 'express';
import {
  getUserGroups,
  getGroupDetails,
  createGroup,
  addMember,
  updateRole,
  removeMember,
} from '../controllers/groupController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getUserGroups);
router.post('/', createGroup);
router.get('/:groupId', getGroupDetails);
router.post('/:groupId/members', addMember);
router.put('/:groupId/members/role', updateRole);
router.delete('/:groupId/members/:userId', removeMember);

export default router;
