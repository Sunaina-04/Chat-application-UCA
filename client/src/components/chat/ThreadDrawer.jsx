import React from 'react';
import { X, MessageSquare, CornerDownRight } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';

export const ThreadDrawer = () => {
  const { activeThread, threadReplies, closeThread, isLoadingThread } = useChat();

  if (!activeThread) return null;

  return (
    <aside className="w-80 sm:w-96 h-full bg-chatdark-sidebar border-l border-chatdark-border flex flex-col z-20 animate-slide-up shadow-2xl">
      {/* Thread Header */}
      <div className="h-14 px-4 border-b border-chatdark-border flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-slate-100">Thread</h3>
          <span className="text-[11px] text-slate-400">
            ({threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'})
          </span>
        </div>
        <button
          onClick={closeThread}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-chatdark-card transition-colors"
          title="Close Thread"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Thread Content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {/* Root Message Card */}
        <div className="px-2">
          <div className="p-3 bg-chatdark-card/90 rounded-2xl border border-brand-500/30 shadow-sm">
            <div className="text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3" />
              <span>Original Message</span>
            </div>
            <MessageItem message={activeThread} onReply={() => {}} isHighlighted={false} />
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center px-4">
          <div className="flex-1 h-[1px] bg-chatdark-border/60" />
          <span className="px-2 text-[10px] uppercase font-bold text-slate-500">Replies</span>
          <div className="flex-1 h-[1px] bg-chatdark-border/60" />
        </div>

        {/* Replies Stream */}
        {isLoadingThread ? (
          <div className="p-6 text-center text-xs text-slate-500">Loading replies...</div>
        ) : threadReplies.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No replies in this thread yet. Be the first to answer!
          </div>
        ) : (
          <div className="space-y-1">
            {threadReplies.map((reply) => (
              <MessageItem key={reply._id} message={reply} onReply={() => {}} />
            ))}
          </div>
        )}
      </div>

      {/* Thread Reply Composer */}
      <MessageComposer
        replyingTo={activeThread}
        onCancelReply={() => {}}
        placeholder="Reply to thread..."
      />
    </aside>
  );
};
