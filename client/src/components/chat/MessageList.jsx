import React, { useEffect, useRef, useState } from 'react';
import { MessageItem } from './MessageItem';
import { MessageSquare, Sparkles, ChevronDown, Calendar } from 'lucide-react';

const formatSeparatorDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
};

const getDateKey = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toDateString();
};

export const MessageList = ({ messages, isLoading, onReply, currentTitle = 'Chat' }) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadBelow, setUnreadBelow] = useState(0);

  const scrollToBottom = (behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    setShowScrollBottom(false);
    setUnreadBelow(0);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
    if (isNearBottom) {
      setUnreadBelow(0);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom) {
      scrollToBottom('smooth');
    } else {
      setShowScrollBottom(true);
      setUnreadBelow((prev) => prev + 1);
    }
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

  let lastDateKey = null;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-1"
      >
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

        {messages.map((message) => {
          const messageDateKey = getDateKey(message.createdAt);
          const showSeparator = messageDateKey && messageDateKey !== lastDateKey;
          if (showSeparator) {
            lastDateKey = messageDateKey;
          }

          return (
            <React.Fragment key={message._id}>
              {showSeparator && (
                <div className="relative flex items-center justify-center my-4 px-4 select-none">
                  <div className="flex-grow border-t border-chatdark-border/50" />
                  <span className="flex-shrink mx-3 px-3 py-1 bg-chatdark-card/90 border border-chatdark-border/80 rounded-full text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 shadow-sm">
                    <Calendar className="w-3 h-3 text-brand-400" />
                    {formatSeparatorDate(message.createdAt)}
                  </span>
                  <div className="flex-grow border-t border-chatdark-border/50" />
                </div>
              )}
              <MessageItem message={message} onReply={onReply} />
            </React.Fragment>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute right-6 bottom-4 flex items-center gap-2 px-3 py-1.5 bg-brand-600/90 hover:bg-brand-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-brand-950/80 backdrop-blur-md transition-all hover:scale-105 active:scale-95 animate-slide-up z-20"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
          <span>Jump to present</span>
          {unreadBelow > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-white text-brand-600 rounded-full text-[10px] font-bold">
              {unreadBelow}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
