import { verifyToken } from '../config/jwt.js';
import { store } from '../services/store.js';
import { logger } from '../utils/logger.js';

export const registerSocketHandlers = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication token required for Socket.IO'));
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return next(new Error('Invalid socket token'));
    }

    const user = store.getUserById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id;
    const username = socket.user.username;

    logger.info(`⚡ Socket connected: ${username} (${userId}) [Socket ID: ${socket.id}]`);

    // 1. Join personal room for notifications & direct updates
    socket.join(`user:${userId}`);

    // Update user status to online
    store.setUserStatus(userId, 'online');
    io.emit('user_online', { userId, status: 'online' });

    // 2. Room / Conversation Room Join & Leave
    socket.on('join_conversation', ({ conversationId }) => {
      if (!conversationId) return;
      const roomKey = `private-chat:${conversationId}`;
      socket.join(roomKey);
      logger.info(`User ${username} joined ${roomKey}`);
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      if (!conversationId) return;
      const roomKey = `private-chat:${conversationId}`;
      socket.leave(roomKey);
    });

    socket.on('join_room', ({ roomId }) => {
      if (!roomId) return;
      const roomKey = `group-room:${roomId}`;
      socket.join(roomKey);
      logger.info(`User ${username} joined ${roomKey}`);
    });

    socket.on('leave_room', ({ roomId }) => {
      if (!roomId) return;
      const roomKey = `group-room:${roomId}`;
      socket.leave(roomKey);
    });

    // 3. Sending Messages
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, roomId, content, parentMessageId, attachments } = data;

        if (!content && (!attachments || attachments.length === 0)) {
          if (callback) callback({ error: 'Message cannot be empty.' });
          return;
        }

        const message = store.createMessage({
          conversationId,
          roomId,
          senderId: userId,
          content,
          parentMessageId,
          attachments,
        });

        // Broadcast to specific conversation or topic room
        if (roomId) {
          const roomKey = `group-room:${roomId}`;
          io.to(roomKey).emit('receive_message', { message, roomId });
        } else if (conversationId) {
          const roomKey = `private-chat:${conversationId}`;
          io.to(roomKey).emit('receive_message', { message, conversationId });

          // Also notify other participants on their user channel if not in active conversation room
          const conv = store.getConversationById(conversationId);
          if (conv) {
            conv.participants.forEach(pId => {
              if (pId !== userId) {
                io.to(`user:${pId}`).emit('conversation_updated', {
                  conversationId,
                  lastMessage: message,
                  unreadCount: (conv.unreadCounts && conv.unreadCounts[pId]) || 1,
                });
              }
            });
          }
        }

        if (callback) callback({ success: true, message });
      } catch (err) {
        logger.error(`send_message error: ${err.message}`);
        if (callback) callback({ error: err.message });
      }
    });

    // 4. Typing Indicators
    socket.on('typing_start', ({ conversationId, roomId }) => {
      const payload = { userId, username, conversationId, roomId };
      if (roomId) {
        socket.to(`group-room:${roomId}`).emit('typing_start', payload);
      } else if (conversationId) {
        socket.to(`private-chat:${conversationId}`).emit('typing_start', payload);
      }
    });

    socket.on('typing_stop', ({ conversationId, roomId }) => {
      const payload = { userId, username, conversationId, roomId };
      if (roomId) {
        socket.to(`group-room:${roomId}`).emit('typing_stop', payload);
      } else if (conversationId) {
        socket.to(`private-chat:${conversationId}`).emit('typing_stop', payload);
      }
    });

    // 5. Message Edit
    socket.on('message_edit', ({ messageId, content }, callback) => {
      try {
        const updated = store.editMessage(messageId, userId, content);
        const targetRoom = updated.roomId ? `group-room:${updated.roomId}` : `private-chat:${updated.conversationId}`;
        io.to(targetRoom).emit('message_edited', { message: updated });
        if (callback) callback({ success: true, message: updated });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    // 6. Message Delete
    socket.on('message_delete', ({ messageId, deleteForEveryone }, callback) => {
      try {
        const result = store.deleteMessage(messageId, userId, deleteForEveryone);
        if (deleteForEveryone) {
          const targetRoom = result.message.roomId ? `group-room:${result.message.roomId}` : `private-chat:${result.message.conversationId}`;
          io.to(targetRoom).emit('message_deleted', {
            messageId,
            deleteForEveryone: true,
            message: result.message,
          });
        } else {
          socket.emit('message_deleted', {
            messageId,
            deleteForEveryone: false,
          });
        }
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    // 7. Reactions
    socket.on('reaction_toggle', ({ messageId, emoji }, callback) => {
      try {
        const updated = store.toggleReaction(messageId, userId, emoji);
        const targetRoom = updated.roomId ? `group-room:${updated.roomId}` : `private-chat:${updated.conversationId}`;
        io.to(targetRoom).emit('reaction_updated', { message: updated });
        if (callback) callback({ success: true, message: updated });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    // 8. Delivered & Read Receipts
    socket.on('message_read', ({ conversationId }) => {
      if (!conversationId) return;
      store.markConversationRead(conversationId, userId);
      socket.to(`private-chat:${conversationId}`).emit('messages_read_by_user', {
        conversationId,
        userId,
        readAt: new Date(),
      });
    });

    // 9. Disconnect handling
    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${username} (${userId})`);
      store.setUserStatus(userId, 'offline');
      io.emit('user_offline', { userId, lastSeen: new Date() });
    });
  });
};
