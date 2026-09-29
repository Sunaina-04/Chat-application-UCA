import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { MessageSquare, Sparkles } from 'lucide-react';

export const MessageList = ({ messages, isLoading, onReply, currentTitle = 'Chat' }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-500">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-brand-950/60 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-3 shadow-glow-brand">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200">Welcome to {currentTitle}!</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          This is the beginning of the conversation. Send a message to start the discussion!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {/* Welcome banner top */}
      <div className="px-6 py-6 border-b border-chatdark-border/40 mb-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-chatdark-card flex items-center justify-center text-brand-400 mb-2 border border-chatdark-border">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-100">{currentTitle}</h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time messages and replies in this room.
        </p>
      </div>

      {messages.map((message) => (
        <MessageItem key={message._id} message={message} onReply={onReply} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
};
