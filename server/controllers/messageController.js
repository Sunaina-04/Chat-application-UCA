import { store } from '../services/store.js';

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId, roomId, parentMessageId, limit, before } = req.query;

    if (!conversationId && !roomId) {
      return res.status(400).json({ success: false, message: 'Either conversationId or roomId must be specified.' });
    }

    // Check authorization
    if (conversationId) {
      const conv = store.getConversationById(conversationId);
      if (!conv || !conv.participants.includes(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view these messages.' });
      }
    } else if (roomId) {
      const room = store.getRoomById(roomId);
      if (!room || !store.isGroupMember(room.groupId, req.user._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this room messages.' });
      }
    }

    const messages = store.getMessages({
      conversationId,
      roomId,
      parentMessageId: parentMessageId !== undefined ? parentMessageId : null,
      limit: parseInt(limit, 10) || 50,
      before,
      userId: req.user._id,
    });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

export const getThreadMessages = async (req, res, next) => {
  try {
    const { parentMessageId } = req.params;
    const parent = store.getMessageById(parentMessageId);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent message not found.' });

    const replies = store.getMessages({
      parentMessageId,
      userId: req.user._id,
    });

    res.json({ success: true, parent, replies });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, roomId, content, parentMessageId, attachments } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message content or attachments required.' });
    }

    if (conversationId) {
      const conv = store.getConversationById(conversationId);
      if (!conv || !conv.participants.includes(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to send message to this conversation.' });
      }
    } else if (roomId) {
      const room = store.getRoomById(roomId);
      if (!room || !store.isGroupMember(room.groupId, req.user._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to send message to this room.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'conversationId or roomId required.' });
    }

    const message = store.createMessage({
      conversationId,
      roomId,
      senderId: req.user._id,
      content,
      parentMessageId,
      attachments,
    });

    // Check for thread reply notification
    if (parentMessageId) {
      const parent = store.getMessageById(parentMessageId);
      if (parent && parent.senderId !== req.user._id) {
        store.createNotification({
          recipientId: parent.senderId,
          senderId: req.user._id,
          type: 'reply',
          title: `New reply from ${req.user.username}`,
          message: `${req.user.username} replied to your message: "${content.slice(0, 60)}"`,
          link: roomId ? `/groups/${store.getRoomById(roomId).groupId}/rooms/${roomId}` : `/chats`,
        });
      }
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content cannot be empty.' });
    }

    const updated = store.editMessage(messageId, req.user._id, content);
    res.json({ success: true, message: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;

    const result = store.deleteMessage(messageId, req.user._id, !!deleteForEveryone);
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

export const toggleReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ success: false, message: 'Emoji is required.' });

    const message = store.toggleReaction(messageId, req.user._id, emoji);
    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
