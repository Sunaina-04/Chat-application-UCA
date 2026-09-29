import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { sounds } from '../utils/sound';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket, joinConversation, leaveConversation, joinRoom, leaveRoom } = useSocket();

  const [currentView, setCurrentView] = useState('groups'); // 'groups' or 'dms'
  const [groups, setGroups] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Thread panel state
  const [activeThread, setActiveThread] = useState(null); // root message
  const [threadReplies, setThreadReplies] = useState([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  // Modals state
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Active channel key for typing indicators
  const activeChannelKey = activeRoomId
    ? `room_${activeRoomId}`
    : activeConversationId
    ? `conv_${activeConversationId}`
    : null;

  // 1. Initial Load of Groups & Conversations
  const refreshWorkspace = async () => {
    if (!isAuthenticated) return;
    try {
      const [groupsRes, convsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/conversations'),
      ]);

      if (groupsRes.success) {
        setGroups(groupsRes.groups);
        // Default to first group & general room if nothing selected
        if (!activeGroupId && groupsRes.groups.length > 0) {
          const firstGroup = groupsRes.groups[0];
          setActiveGroupId(firstGroup._id);
          const generalRoom = firstGroup.rooms?.find(r => r.name === 'general') || firstGroup.rooms?.[0];
          if (generalRoom) {
            setActiveRoomId(generalRoom._id);
          }
        }
      }

      if (convsRes.success) {
        setConversations(convsRes.conversations);
      }
    } catch (err) {
      console.error('Failed to load groups/conversations', err);
    }
  };

  useEffect(() => {
    refreshWorkspace();
  }, [isAuthenticated, user?._id]);

  // 2. Room / Conversation Switching & Socket Joining
  useEffect(() => {
    if (activeRoomId) {
      joinRoom(activeRoomId);
      loadMessages({ roomId: activeRoomId });
      return () => {
        leaveRoom(activeRoomId);
      };
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
      loadMessages({ conversationId: activeConversationId });
      // Mark as read
      api.put(`/conversations/${activeConversationId}/read`).catch(() => {});
      return () => {
        leaveConversation(activeConversationId);
      };
    }
  }, [activeConversationId]);

  // 3. Load Messages
  const loadMessages = async ({ conversationId, roomId }) => {
    setIsLoadingMessages(true);
    try {
      const params = {};
      if (roomId) params.roomId = roomId;
      if (conversationId) params.conversationId = conversationId;

      const res = await api.get('/messages', { params });
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 4. Load Thread Replies
  const loadThreadReplies = async (parentMessageId) => {
    setIsLoadingThread(true);
    try {
      const res = await api.get(`/messages/thread/${parentMessageId}`);
      if (res.success) {
        setActiveThread(res.parent);
        setThreadReplies(res.replies);
      }
    } catch (err) {
      console.error('Failed to fetch thread', err);
    } finally {
      setIsLoadingThread(false);
    }
  };

  // 5. Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ message, roomId, conversationId }) => {
      // Check if it belongs to current active view
      const isCurrentRoom = roomId && roomId === activeRoomId;
      const isCurrentConv = conversationId && conversationId === activeConversationId;

      if (isCurrentRoom || isCurrentConv) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });

        if (message.senderId !== user?._id) {
          sounds.playReceive();
        }
      }

      // If reply belongs to the active opened thread
      if (activeThread && message.parentMessageId === activeThread._id) {
        setThreadReplies(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update parent message reply count in main feed
      if (message.parentMessageId) {
        setMessages(prev =>
          prev.map(m =>
            m._id === message.parentMessageId
              ? { ...m, replyCount: (m.replyCount || 0) + 1 }
              : m
          )
        );
      }

      // If personal chat, update conversation list snippet
      if (conversationId) {
        setConversations(prev =>
          prev.map(c => {
            if (c._id === conversationId) {
              return {
                ...c,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: isCurrentConv ? 0 : (c.unreadCount || 0) + (message.senderId === user?._id ? 0 : 1),
              };
            }
            return c;
          })
        );
      }
    };

    const handleMessageEdited = ({ message }) => {
      setMessages(prev => prev.map(m => (m._id === message._id ? { ...m, ...message } : m)));
      if (activeThread && activeThread._id === message._id) {
        setActiveThread(prev => ({ ...prev, ...message }));
      }
      setThreadReplies(prev => prev.map(m => (m._id === message._id ? { ...m, ...message } : m)));
    };

    const handleMessageDeleted = ({ messageId, deleteForEveryone, message }) => {
      if (deleteForEveryone && message) {
        setMessages(prev => prev.map(m => (m._id === messageId ? message : m)));
        if (activeThread && activeThread._id === messageId) {
          setActiveThread(message);
        }
        setThreadReplies(prev => prev.map(m => (m._id === messageId ? message : m)));
      } else {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setThreadReplies(prev => prev.filter(m => m._id !== messageId));
      }
    };

    const handleReactionUpdated = ({ message }) => {
      setMessages(prev =>
        prev.map(m => (m._id === message._id ? { ...m, reactions: message.reactions } : m))
      );
      if (activeThread && activeThread._id === message._id) {
        setActiveThread(prev => ({ ...prev, reactions: message.reactions }));
      }
      setThreadReplies(prev =>
        prev.map(m => (m._id === message._id ? { ...m, reactions: message.reactions } : m))
      );
    };

    const handleConversationUpdated = ({ conversationId, lastMessage, unreadCount }) => {
      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId
            ? { ...c, lastMessage, unreadCount, updatedAt: lastMessage.createdAt }
            : c
        )
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('reaction_updated', handleReactionUpdated);
    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('reaction_updated', handleReactionUpdated);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, activeRoomId, activeConversationId, activeThread, user?._id]);

  // Actions
  const selectGroup = (groupId, preferredRoomId = null) => {
    setCurrentView('groups');
    setActiveGroupId(groupId);
    setActiveConversationId(null);

    const group = groups.find(g => g._id === groupId);
    if (group && group.rooms && group.rooms.length > 0) {
      if (preferredRoomId && group.rooms.some(r => r._id === preferredRoomId)) {
        setActiveRoomId(preferredRoomId);
      } else {
        const general = group.rooms.find(r => r.name === 'general') || group.rooms[0];
        setActiveRoomId(general._id);
      }
    } else {
      setActiveRoomId(null);
    }
  };

  const selectRoom = (roomId) => {
    setCurrentView('groups');
    setActiveRoomId(roomId);
    setActiveConversationId(null);
  };

  const selectConversation = (convId) => {
    setCurrentView('dms');
    setActiveConversationId(convId);
    setActiveRoomId(null);
  };

  const startConversationWithUser = async (targetUserId) => {
    try {
      const res = await api.post('/conversations', { targetUserId });
      if (res.success) {
        setConversations(prev => {
          if (prev.some(c => c._id === res.conversation._id)) return prev;
          return [res.conversation, ...prev];
        });
        selectConversation(res.conversation._id);
        return res.conversation;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const sendMessage = async ({ content, parentMessageId, attachments }) => {
    if (!socket) return;
    sounds.playSend();

    const payload = {
      content,
      parentMessageId: parentMessageId || null,
      attachments: attachments || [],
      roomId: currentView === 'groups' ? activeRoomId : null,
      conversationId: currentView === 'dms' ? activeConversationId : null,
    };

    socket.emit('send_message', payload, (res) => {
      if (res && res.error) {
        console.error('Send error:', res.error);
      }
    });
  };

  const editMessage = async (messageId, content) => {
    if (!socket) return;
    socket.emit('message_edit', { messageId, content });
  };

  const deleteMessage = async (messageId, deleteForEveryone = false) => {
    if (!socket) return;
    socket.emit('message_delete', { messageId, deleteForEveryone });
  };

  const toggleReaction = async (messageId, emoji) => {
    if (!socket) return;
    socket.emit('reaction_toggle', { messageId, emoji });
  };

  const createGroup = async (name, description, image) => {
    const res = await api.post('/groups', { name, description, image });
    if (res.success) {
      setGroups(prev => [res.group, ...prev]);
      selectGroup(res.group._id);
      setIsCreateGroupOpen(false);
      return res.group;
    }
  };

  const createRoom = async (groupId, name, description, visibility) => {
    const res = await api.post(`/rooms/group/${groupId}`, { name, description, visibility });
    if (res.success) {
      setGroups(prev =>
        prev.map(g => (g._id === groupId ? { ...g, rooms: [...(g.rooms || []), res.room] } : g))
      );
      selectRoom(res.room._id);
      setIsCreateRoomOpen(false);
      return res.room;
    }
  };

  const openThread = (message) => {
    setActiveThread(message);
    loadThreadReplies(message._id);
  };

  const closeThread = () => {
    setActiveThread(null);
    setThreadReplies([]);
  };

  // Find active group and active room object
  const activeGroup = groups.find(g => g._id === activeGroupId) || null;
  const activeRoom = activeGroup?.rooms?.find(r => r._id === activeRoomId) || null;
  const activeConversation = conversations.find(c => c._id === activeConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        currentView,
        setCurrentView,
        groups,
        conversations,
        activeGroupId,
        activeRoomId,
        activeConversationId,
        activeGroup,
        activeRoom,
        activeConversation,
        activeChannelKey,
        messages,
        isLoadingMessages,
        activeThread,
        threadReplies,
        isLoadingThread,
        // Modals
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        isCreateRoomOpen,
        setIsCreateRoomOpen,
        isGroupSettingsOpen,
        setIsGroupSettingsOpen,
        isSearchOpen,
        setIsSearchOpen,
        isDemoSwitcherOpen,
        setIsDemoSwitcherOpen,
        isProfileOpen,
        setIsProfileOpen,
        // Operations
        selectGroup,
        selectRoom,
        selectConversation,
        startConversationWithUser,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        createGroup,
        createRoom,
        openThread,
        closeThread,
        refreshWorkspace,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
