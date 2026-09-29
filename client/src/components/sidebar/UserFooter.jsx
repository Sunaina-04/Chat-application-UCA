import React, { useState } from 'react';
import { LogOut, User, RefreshCw, ChevronUp, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useNotifications } from '../../context/NotificationContext';
import { Avatar } from '../common/Avatar';

export const UserFooter = () => {
  const { user, logout, updateStatus } = useAuth();
  const { setIsDemoSwitcherOpen, setIsProfileOpen } = useChat();
  const { unreadCount } = useNotifications();
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  if (!user) return null;

  const statuses = [
    { id: 'online', label: 'Online', color: 'bg-emerald-500' },
    { id: 'away', label: 'Away', color: 'bg-amber-500' },
    { id: 'busy', label: 'Do Not Disturb', color: 'bg-rose-500' },
    { id: 'offline', label: 'Invisible', color: 'bg-slate-500' },
  ];

  return (
    <div className="relative h-14 bg-chatdark-rail/90 px-3 border-t border-chatdark-border flex items-center justify-between select-none">
      {/* Current User Info */}
      <div
        onClick={() => setIsProfileOpen(true)}
        className="flex items-center gap-2.5 cursor-pointer p-1 -ml-1 rounded-lg hover:bg-chatdark-hover/70 transition-colors truncate max-w-[130px]"
        title="View Profile"
      >
        <Avatar src={user.avatar} name={user.username} size="sm" status={user.status || 'online'} />
        <div className="truncate">
          <p className="text-xs font-bold text-slate-100 truncate leading-tight">{user.username}</p>
          <p className="text-[10px] text-slate-400 truncate leading-tight capitalize">
            {user.status || 'online'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {/* Status selector */}
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-chatdark-card transition-colors"
            title="Set Status"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {isStatusOpen && (
            <div className="absolute bottom-10 left-0 w-36 glass-dropdown rounded-xl p-1 z-50 animate-slide-up shadow-xl">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    updateStatus(s.id);
                    setIsStatusOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-brand-600 rounded-lg transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Switcher Quick Button */}
        <button
          onClick={() => setIsDemoSwitcherOpen(true)}
          className="p-1.5 rounded-lg text-brand-400 hover:text-brand-300 hover:bg-chatdark-card transition-colors"
          title="Switch Demo User"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-chatdark-card transition-colors"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
