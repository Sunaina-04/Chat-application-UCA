import React, { useState } from 'react';
import {
  Hash,
  Search,
  Bell,
  Users,
  MessageSquare,
  Sparkles,
  Phone,
  Video,
  X,
  Check,
  Pin,
  BarChart2,
  Download,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';

export const ChatHeader = () => {
  const {
    currentView,
    activeRoom,
    activeGroup,
    activeConversation,
    setIsSearchOpen,
    pinnedMessages,
    isPinnedOpen,
    setIsPinnedOpen,
    setIsCreatePollOpen,
    messages,
  } = useChat();
  const { isUserOnline, isConnected } = useSocket();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const formatLastSeen = (date) => {
    if (!date) return 'Offline';
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'Active just now';
    if (mins < 60) return `Last seen ${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `Last seen ${hours}h ago`;
  };

  const handleExportTranscript = () => {
    if (!messages || messages.length === 0) {
      alert('No messages to export in this channel.');
      return;
    }

    const title =
      currentView === 'groups'
        ? `${activeGroup?.name || 'Group'}_#${activeRoom?.name || 'general'}`
        : `DM_with_${activeConversation?.participant?.username || 'user'}`;

    let md = `# 💬 ChatSpace Transcript — ${title}\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n`;
    md += `---\n\n`;

    messages.forEach((m) => {
      const time = new Date(m.createdAt).toLocaleTimeString();
      const sender = m.sender?.username || 'User';
      md += `### **${sender}** · *${time}*\n`;
      if (m.poll) {
        md += `📊 **POLL: ${m.poll.question}**\n`;
        (m.poll.options || []).forEach((opt, idx) => {
          const vCount = opt.votes?.length || 0;
          md += `- Option ${idx + 1}: ${opt.text} (${vCount} votes)\n`;
        });
        md += `*Total Participants: ${m.poll.totalVotes || 0}*\n\n`;
      } else {
        md += `${m.content || '(Attachment)'}\n\n`;
      }
      if (m.reactions && m.reactions.length > 0) {
        const reactionStr = m.reactions.map((r) => `${r.emoji} (${r.username})`).join(' ');
        md += `> Reactions: ${reactionStr}\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_transcript_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 bg-chatdark-sidebar/80 backdrop-blur-md px-4 border-b border-chatdark-border flex items-center justify-between select-none z-10">
      {/* Left Title Area */}
      <div className="flex items-center gap-3 truncate">
        {currentView === 'groups' && activeRoom ? (
          <>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-brand-400" />
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                {activeRoom.name}
              </h1>
            </div>

            {activeRoom.description && (
              <>
                <div className="w-1 h-1 bg-slate-600 rounded-full hidden sm:block" />
                <p className="text-xs text-slate-400 truncate hidden sm:block max-w-md">
                  {activeRoom.description}
                </p>
              </>
            )}
          </>
        ) : currentView === 'dms' && activeConversation?.participant ? (
          <div className="flex items-center gap-3">
            <Avatar
              src={activeConversation.participant.avatar}
              name={activeConversation.participant.username}
              size="sm"
              status={
                isUserOnline(activeConversation.participant._id)
                  ? 'online'
                  : activeConversation.participant.status || 'offline'
              }
            />
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">
                {activeConversation.participant.username}
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                {isUserOnline(activeConversation.participant._id)
                  ? 'Active now'
                  : formatLastSeen(activeConversation.participant.lastSeen)}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Select a room or conversation</span>
        )}
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2">
        {/* Active room members pill / topic count */}
        {currentView === 'groups' && activeGroup?.members && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-chatdark-card/60 border border-chatdark-border rounded-lg text-xs text-slate-300"
            title={`${activeGroup.members.length} members in this community`}
          >
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-semibold">{activeGroup.members.length}</span>
          </div>
        )}

        {/* Live Socket Status Dot */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-chatdark-card/40 border border-chatdark-border text-[11px] text-slate-400"
          title={isConnected ? 'Realtime WebSocket Connected' : 'Reconnecting...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-amber-500 animate-ping'
            }`}
          />
          <span className="hidden sm:inline font-mono">{isConnected ? 'Live' : 'Connecting'}</span>
        </div>

        {/* Pinned Messages Button */}
        <button
          onClick={() => setIsPinnedOpen(!isPinnedOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
            pinnedMessages.length > 0
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
              : 'bg-chatdark-card/40 border-chatdark-border text-slate-400 hover:text-slate-200 hover:bg-chatdark-card'
          }`}
          title={`${pinnedMessages.length} Pinned Messages`}
        >
          <Pin className={`w-3.5 h-3.5 ${pinnedMessages.length > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span className="font-semibold hidden sm:inline">Pinned</span>
          {pinnedMessages.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center justify-center">
              {pinnedMessages.length}
            </span>
          )}
        </button>

        {/* Create Poll Button */}
        <button
          onClick={() => setIsCreatePollOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-chatdark-border bg-chatdark-card/40 text-slate-300 hover:text-white hover:bg-chatdark-card transition-colors text-xs font-semibold"
          title="Create a team poll"
        >
          <BarChart2 className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Poll</span>
        </button>

        {/* Export Transcript Button */}
        <button
          onClick={handleExportTranscript}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-chatdark-card rounded-lg transition-colors"
          title="Export chat transcript (.md)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Search */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-chatdark-card rounded-lg transition-colors"
          title="Search (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-chatdark-card rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-chatdark-sidebar animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-80 max-h-96 glass-dropdown rounded-2xl p-3 z-50 animate-slide-up shadow-2xl flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-chatdark-border/60">
                <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-2 max-h-72">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id)}
                    className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      n.isRead ? 'bg-chatdark-card/40 text-slate-400' : 'bg-brand-950/40 border border-brand-500/20 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-slate-100">{n.title}</p>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-brand-400 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
