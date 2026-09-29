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
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';

export const ChatHeader = () => {
  const { currentView, activeRoom, activeGroup, activeConversation, setIsSearchOpen } = useChat();
  const { isUserOnline } = useSocket();
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
