import React from 'react';
import { MessageSquare, Plus, Compass, Sparkles, Search } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ServerRail = () => {
  const {
    currentView,
    setCurrentView,
    groups,
    activeGroupId,
    selectGroup,
    setIsCreateGroupOpen,
    setIsDemoSwitcherOpen,
    setIsSearchOpen,
    conversations,
  } = useChat();

  const totalDMUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <aside className="w-[72px] h-full bg-chatdark-rail flex flex-col items-center py-3 select-none border-r border-chatdark-sidebar flex-shrink-0 z-20">
      {/* Brand Logo / Home */}
      <button
        onClick={() => {
          setCurrentView('groups');
          if (groups.length > 0 && !activeGroupId) {
            selectGroup(groups[0]._id);
          }
        }}
        className="relative group mb-3 focus:outline-none"
        title="ChatSpace Home"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-glow-brand transition-all duration-300 group-hover:rounded-xl group-hover:scale-105">
          <Sparkles className="w-6 h-6 animate-pulse-subtle" />
        </div>
      </button>

      {/* Global Search Shortcut */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="relative group mb-2 w-12 h-12 rounded-3xl bg-chatdark-card hover:bg-chatdark-hover flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:rounded-2xl"
        title="Search Everywhere (Ctrl+K)"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Direct Messages Icon */}
      <button
        onClick={() => setCurrentView('dms')}
        className={`relative group mb-3 w-12 h-12 flex items-center justify-center transition-all duration-200 focus:outline-none ${
          currentView === 'dms'
            ? 'rounded-2xl bg-brand-600 text-white shadow-glow-brand'
            : 'rounded-3xl bg-chatdark-card text-slate-400 hover:rounded-2xl hover:bg-chatdark-hover hover:text-slate-100'
        }`}
        title="Direct Messages"
      >
        {/* Active Pill Indicator */}
        <span
          className={`absolute -left-3 w-1.5 bg-white rounded-r-full transition-all duration-200 ${
            currentView === 'dms' ? 'h-8' : 'h-0 group-hover:h-3'
          }`}
        />
        <MessageSquare className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {totalDMUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-chatdark-rail animate-bounce">
            {totalDMUnread > 99 ? '99+' : totalDMUnread}
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="w-8 h-[2px] bg-chatdark-border/60 rounded-full mb-3" />

      {/* Groups List */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center gap-3">
        {groups.map((group) => {
          const isActive = currentView === 'groups' && activeGroupId === group._id;
          return (
            <button
              key={group._id}
              onClick={() => selectGroup(group._id)}
              className="relative group w-12 h-12 flex items-center justify-center focus:outline-none"
              title={group.name}
            >
              {/* Active Pill Indicator */}
              <span
                className={`absolute -left-3 w-1.5 bg-white rounded-r-full transition-all duration-200 ${
                  isActive ? 'h-10' : 'h-0 group-hover:h-4'
                }`}
              />

              <div
                className={`w-12 h-12 flex items-center justify-center text-sm font-bold transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'rounded-2xl ring-2 ring-brand-500 shadow-glow-brand'
                    : 'rounded-3xl bg-chatdark-card text-slate-300 hover:rounded-2xl hover:bg-chatdark-hover'
                }`}
              >
                {group.image ? (
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{group.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            </button>
          );
        })}

        {/* Create Group Button */}
        <button
          onClick={() => setIsCreateGroupOpen(true)}
          className="group w-12 h-12 rounded-3xl bg-chatdark-card hover:bg-emerald-600/90 text-emerald-400 hover:text-white flex items-center justify-center transition-all duration-200 hover:rounded-2xl shadow-sm"
          title="Create New Group"
        >
          <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
        </button>
      </div>

      {/* Quick Demo Switcher Indicator Pill */}
      <div className="pt-2 border-t border-chatdark-border/60 w-full flex flex-col items-center">
        <button
          onClick={() => setIsDemoSwitcherOpen(true)}
          className="group relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-950 to-brand-900 border border-brand-500/40 hover:border-brand-400 flex flex-col items-center justify-center text-brand-300 hover:text-white transition-all shadow-glow-accent hover:scale-105"
          title="Switch Demo Identity (Soham, Rahul, Aman, Priya)"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">DEMO</span>
          <Compass className="w-4 h-4 text-brand-300 group-hover:rotate-45 transition-transform" />
        </button>
      </div>
    </aside>
  );
};
