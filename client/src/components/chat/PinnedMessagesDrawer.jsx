import React from 'react';
import { X, Pin, PinOff, CornerDownRight, Calendar } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import { format } from 'date-fns';

export const PinnedMessagesDrawer = () => {
  const { isPinnedOpen, setIsPinnedOpen, pinnedMessages, togglePinMessage } = useChat();

  if (!isPinnedOpen) return null;

  const scrollToMessage = (messageId) => {
    setIsPinnedOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`msg-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-amber-500', 'bg-amber-500/10');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-500/10');
        }, 2000);
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div
        className="w-full max-w-md bg-chatdark-sidebar border-l border-chatdark-border h-full flex flex-col shadow-2xl animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-chatdark-border flex items-center justify-between bg-chatdark-bg/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Pin className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Pinned Messages
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                  {pinnedMessages.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Important bookmarks and announcements</p>
            </div>
          </div>
          <button
            onClick={() => setIsPinnedOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-chatdark-card transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {pinnedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-chatdark-card border border-chatdark-border flex items-center justify-center mb-3 text-slate-500">
                <Pin className="w-6 h-6 opacity-40" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">No Pinned Messages</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Hover over any important message and click the pin icon to keep key notes, links, or guidelines pinned here.
              </p>
            </div>
          ) : (
            pinnedMessages.map((msg) => {
              const sender = msg.sender || { username: 'Unknown' };
              const timeStr = msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, h:mm a') : '';
              const pinnedByStr = msg.pinnedBy?.username ? `Pinned by ${msg.pinnedBy.username}` : 'Pinned message';

              return (
                <div
                  key={msg._id}
                  className="bg-chatdark-card/70 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-3.5 transition-all group relative"
                >
                  {/* Top Sender Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={sender.avatar} name={sender.username} size="xs" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200">{sender.username}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{timeStr}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePinMessage(msg._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all text-xs flex items-center gap-1"
                      title="Unpin message"
                    >
                      <PinOff className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Unpin</span>
                    </button>
                  </div>

                  {/* Message snippet */}
                  <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap pl-1 border-l-2 border-amber-500/40 my-2">
                    {msg.content}
                  </p>

                  {/* Footer Jump Button & Pinned Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-chatdark-border/40 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400/80">
                      <Pin className="w-2.5 h-2.5" />
                      {pinnedByStr}
                    </span>
                    <button
                      onClick={() => scrollToMessage(msg._id)}
                      className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium hover:underline"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Jump to message
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

