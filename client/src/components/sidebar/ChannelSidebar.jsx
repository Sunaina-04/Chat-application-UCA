import React, { useState } from 'react';
import {
  Hash,
  Plus,
  Settings,
  ChevronDown,
  Lock,
  Volume2,
  Users,
  ShieldAlert,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ChannelSidebar = () => {
  const {
    activeGroup,
    activeRoomId,
    selectRoom,
    setIsCreateRoomOpen,
    setIsGroupSettingsOpen,
  } = useChat();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!activeGroup) {
    return (
      <div className="w-60 h-full bg-chatdark-sidebar flex items-center justify-center text-slate-500 text-sm">
        Select a group
      </div>
    );
  }

  const rooms = activeGroup.rooms || [];

  return (
    <div className="w-60 h-full bg-chatdark-sidebar flex flex-col border-r border-chatdark-border select-none">
      {/* Group Header */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full h-14 px-4 border-b border-chatdark-border flex items-center justify-between font-semibold text-slate-100 hover:bg-chatdark-card/60 transition-colors shadow-sm"
        >
          <span className="truncate text-base font-bold text-slate-100 tracking-tight">
            {activeGroup.name}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Group Options Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-14 left-2 right-2 z-50 glass-dropdown rounded-xl p-1.5 animate-slide-up shadow-xl">
            <button
              onClick={() => {
                setIsGroupSettingsOpen(true);
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-brand-600 hover:text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-white" />
              <span>Group Settings & Members</span>
            </button>
            <button
              onClick={() => {
                setIsCreateRoomOpen(true);
                setIsDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-brand-600 hover:text-white rounded-lg transition-colors mt-0.5"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              <span>Create Topic Room</span>
            </button>
          </div>
        )}
      </div>

      {/* Rooms List Section */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <div>
          {/* Header with Add Room (+) */}
          <div className="flex items-center justify-between px-2 mb-1.5 group">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOPIC ROOMS
            </span>
            <button
              onClick={() => setIsCreateRoomOpen(true)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-chatdark-hover transition-colors"
              title="Create Room"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rooms */}
          <div className="space-y-0.5">
            {rooms.map((room) => {
              const isActive = activeRoomId === room._id;
              return (
                <button
                  key={room._id}
                  onClick={() => selectRoom(room._id)}
                  className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-chatdark-card text-brand-300 font-semibold border-l-2 border-brand-500 shadow-sm'
                      : 'text-slate-400 hover:bg-chatdark-hover/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {room.visibility === 'private' ? (
                      <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <Hash
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      />
                    )}
                    <span className="truncate">{room.name}</span>
                  </div>

                  {room.description && (
                    <span
                      className="hidden group-hover:inline-block text-[10px] text-slate-500 font-normal truncate max-w-[70px]"
                      title={room.description}
                    >
                      {room.description}
                    </span>
                  )}
                </button>
              );
            })}

            {rooms.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No rooms yet. Create the first topic room!
              </div>
            )}
          </div>
        </div>

        {/* Group Info Box */}
        <div className="mt-4 px-2">
          <div className="p-3 rounded-xl bg-chatdark-card/50 border border-chatdark-border/60 text-xs">
            <p className="text-slate-300 font-medium line-clamp-2">
              {activeGroup.description || 'Welcome to this workspace.'}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-chatdark-border/40 text-[11px] text-slate-400">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span>{activeGroup.membersCount || activeGroup.members?.length || 1} Members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
