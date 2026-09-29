import React, { useState, useEffect } from 'react';
import { Search, X, Hash, Users, MessageSquare, ArrowRight, CornerDownRight } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../common/Avatar';
import api from '../../services/api';

export const GlobalSearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    selectGroup,
    selectRoom,
    selectConversation,
    startConversationWithUser,
  } = useChat();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], groups: [], rooms: [], messages: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], groups: [], rooms: [], messages: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/notifications/search/global?q=${encodeURIComponent(query)}`);
        if (res.success) {
          setResults(res.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectUser = async (userId) => {
    await startConversationWithUser(userId);
    setIsSearchOpen(false);
  };

  const handleSelectRoom = (groupId, roomId) => {
    selectGroup(groupId, roomId);
    setIsSearchOpen(false);
  };

  const hasAnyResults =
    results.users.length > 0 ||
    results.groups.length > 0 ||
    results.rooms.length > 0 ||
    results.messages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-chatdark-card border border-chatdark-border rounded-3xl p-5 shadow-2xl animate-slide-up relative">
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, groups, topic rooms, and messages..."
            className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
          />
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {query.trim() && !isSearching && !hasAnyResults && (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for "<span className="text-slate-200">{query}</span>"
            </div>
          )}

          {/* Rooms */}
          {results.rooms.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Topic Rooms
              </div>
              <div className="space-y-1">
                {results.rooms.map((room) => (
                  <button
                    key={room._id}
                    onClick={() => handleSelectRoom(room.groupId, room._id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-chatdark-hover text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Hash className="w-4 h-4 text-brand-400" />
                      <div>
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                          #{room.name}
                        </span>
                        {room.groupName && (
                          <span className="text-xs text-slate-400 ml-2">in {room.groupName}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {results.messages.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Messages
              </div>
              <div className="space-y-1">
                {results.messages.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => {
                      if (msg.roomId) {
                        selectRoom(msg.roomId);
                      } else if (msg.conversationId) {
                        selectConversation(msg.conversationId);
                      }
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-chatdark-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300">
                        {msg.sender?.username} in {msg.contextName}
                      </span>
                      <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-200 line-clamp-1">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Users
              </div>
              <div className="space-y-1">
                {results.users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-chatdark-hover text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.username} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white">
                          {user.username}
                        </p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-brand-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Chat
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Groups */}
          {results.groups.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Groups
              </div>
              <div className="space-y-1">
                {results.groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => {
                      selectGroup(group._id);
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-chatdark-hover text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                        {group.name}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
