import { store } from '../services/store.js';

export const getUserConversations = async (req, res, next) => {
  try {
    const list = store.getUserConversations(req.user._id);
    res.json({ success: true, conversations: list });
  } catch (error) {
    next(error);
  }
};

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId is required.' });
    }

    if (targetUserId === req.user._id) {
      return res.status(400).json({ success: false, message: 'Cannot create personal conversation with yourself.' });
    }

    const targetUser = store.getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    const conversation = store.getOrCreateConversation(req.user._id, targetUserId);
    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    store.markConversationRead(id, req.user._id);
    res.json({ success: true, message: 'Conversation marked as read.' });
  } catch (error) {
    next(error);
  }
};
