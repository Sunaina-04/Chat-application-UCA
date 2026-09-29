import { store } from '../services/store.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const users = store.getAllUsers(currentUserId);
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user ? req.user._id : null;
    const users = store.searchUsers(q || '', currentUserId);
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline', 'away', 'busy'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    store.setUserStatus(req.user._id, status);
    const updated = store.getUserById(req.user._id);
    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};
