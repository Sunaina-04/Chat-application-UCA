import React from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';

export const DemoSwitcherModal = () => {
  const { user: currentUser, demoUsers, demoLogin } = useAuth();
  const { isDemoSwitcherOpen, setIsDemoSwitcherOpen, refreshWorkspace } = useChat();

  if (!isDemoSwitcherOpen) return null;

  const handleSelectUser = async (userId) => {
    try {
      await demoLogin(userId);
      await refreshWorkspace();
      setIsDemoSwitcherOpen(false);
    } catch (e) {
      console.error('Demo switch error', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-chatdark-card border border-chatdark-border rounded-3xl p-6 shadow-2xl animate-slide-up relative">
        <button
          onClick={() => setIsDemoSwitcherOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-glow-brand">
            <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <span>Quick Demo Switcher</span>
              <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Instant Mode
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Switch identities in 1-click to test multi-user real-time chats, topic rooms & threads!
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 bg-chatdark-sidebar p-3 rounded-2xl border border-chatdark-border/60">
          💡 <strong className="text-slate-200">Tip:</strong> Open a second browser tab or incognito window with a different demo user to watch real-time messages, typing indicators, reactions, and thread replies sync live!
        </p>

        {/* Demo Users List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {demoUsers.map((demoUser) => {
            const isCurrent = currentUser?._id === demoUser._id;
            return (
              <div
                key={demoUser._id}
                onClick={() => !isCurrent && handleSelectUser(demoUser._id)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isCurrent
                    ? 'bg-brand-950/60 border-brand-500/80 shadow-glow-brand ring-1 ring-brand-500/30'
                    : 'bg-chatdark-sidebar border-chatdark-border hover:border-brand-500/50 hover:bg-chatdark-hover'
                }`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <Avatar
                    src={demoUser.avatar}
                    name={demoUser.username}
                    size="lg"
                    status={demoUser.status || 'online'}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{demoUser.username}</h4>
                      {demoUser.username === 'Soham' && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-md">
                          CSE Owner
                        </span>
                      )}
                      {demoUser.username === 'Rahul' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-md">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{demoUser.bio}</p>
                    <p className="text-[11px] text-slate-500">{demoUser.email}</p>
                  </div>
                </div>

                {isCurrent ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectUser(demoUser._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chatdark-card hover:bg-brand-600 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <span>Switch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
