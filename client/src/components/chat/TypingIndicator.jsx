import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';

export const TypingIndicator = () => {
  const { activeChannelKey } = useChat();
  const { getChannelTypingUsers } = useSocket();

  if (!activeChannelKey) return null;

  const typingUsers = getChannelTypingUsers(activeChannelKey);
  if (typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = 'Several people are typing...';
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-brand-300 select-none animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
      </div>
      <span className="font-medium italic">{text}</span>
    </div>
  );
};
