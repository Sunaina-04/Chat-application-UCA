import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingMap, setTypingMap] = useState({}); // { [channelKey]: Set<username> }
  const typingTimeouts = useRef({});

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      window.location.origin;

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user) {
        setOnlineUsers(prev => new Set(prev).add(user._id));
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Real-time typing indicators
    newSocket.on('typing_start', ({ username, conversationId, roomId }) => {
      const channelKey = roomId ? `room_${roomId}` : `conv_${conversationId}`;
      setTypingMap(prev => {
        const currentSet = new Set(prev[channelKey] || []);
        currentSet.add(username);
        return { ...prev, [channelKey]: currentSet };
      });

      // Clear existing timeout for this user in this channel
      const timerKey = `${channelKey}:${username}`;
      if (typingTimeouts.current[timerKey]) {
        clearTimeout(typingTimeouts.current[timerKey]);
      }

      // Automatically expire typing indicator after 3.5 seconds
      typingTimeouts.current[timerKey] = setTimeout(() => {
        setTypingMap(prev => {
          const currentSet = new Set(prev[channelKey] || []);
          currentSet.delete(username);
          return { ...prev, [channelKey]: currentSet };
        });
      }, 3500);
    });

    newSocket.on('typing_stop', ({ username, conversationId, roomId }) => {
      const channelKey = roomId ? `room_${roomId}` : `conv_${conversationId}`;
      setTypingMap(prev => {
        const currentSet = new Set(prev[channelKey] || []);
        currentSet.delete(username);
        return { ...prev, [channelKey]: currentSet };
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', { conversationId });
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', { conversationId });
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { roomId });
    }
  };

  const emitTypingStart = ({ conversationId, roomId }) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId, roomId });
    }
  };

  const emitTypingStop = ({ conversationId, roomId }) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId, roomId });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const getChannelTypingUsers = (channelKey) => {
    const set = typingMap[channelKey];
    return set ? Array.from(set) : [];
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        isUserOnline,
        getChannelTypingUsers,
        joinConversation,
        leaveConversation,
        joinRoom,
        leaveRoom,
        emitTypingStart,
        emitTypingStop,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
