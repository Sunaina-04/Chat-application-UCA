import React from 'react';
import { X, User, Mail, Calendar, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export const UserProfileModal = () => {
  const { user, isProfileOpen, setIsProfileOpen } = useAuth();

  if (!isProfileOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-chatdark-card border border-chatdark-border rounded-3xl p-6 shadow-2xl animate-slide-up relative">
        <button
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Banner */}
        <div className="h-20 -mx-6 -mt-6 rounded-t-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 mb-8 relative">
          <div className="absolute -bottom-6 left-6">
            <Avatar src={user.avatar} name={user.username} size="xl" status={user.status || 'online'} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-100">{user.username}</h3>
            <p className="text-xs text-brand-300 font-medium capitalize flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{user.status || 'online'}</span>
            </p>
          </div>

          <div className="p-3.5 bg-chatdark-sidebar border border-chatdark-border/60 rounded-2xl text-xs space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="italic">{user.bio || 'Available on ChatSpace'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-400 text-[11px] pt-1 border-t border-chatdark-border/40">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Joined ChatSpace Workspace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
