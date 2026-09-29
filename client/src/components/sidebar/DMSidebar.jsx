import React, { useState } from 'react';
import { Search, UserPlus, MessageSquare, Plus } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../common/Avatar';
import api from '../../services/api';

export const DMSidebar = () => {
  const { conversations, activeConversationId, selectConversation, startConversationWithUser } = useChat();
  const { isUserOnline } = useSocket();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);

    if (q.trim().length > 0) {
      setIsSearching(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
        if (res.success) {
          setSearchResults(res.users);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      await startConversationWithUser(userId);
      setSearchQuery('');
      setIsSearching(false);
      setSearchResults([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-64 h-full bg-chatdark-sidebar flex flex-col border-r border-chatdark-border select-none">
      {/* Header */}
      <div className="h-14 px-4 border-b border-chatdark-border flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400" />
          <span>Direct Messages</span>
        </h2>
      </div>

      {/* User Search Input */}
      <div className="p-3 border-b border-chatdark-border/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Find or start a chat..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-chatdark-card text-xs text-slate-100 pl-9 pr-3 py-2 rounded-lg border border-chatdark-border focus:outline-none focus:border-brand-500 placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Conversations or Search Results List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {isSearching ? (
          <div>
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Search Results
            </div>
            {searchResults.map((user) => (
              <button
                key={user._id}
                onClick={() => handleStartChat(user._id)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-chatdark-hover text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar
                    src={user.avatar}
                    name={user.username}
                    size="sm"
                    status={isUserOnline(user._id) ? 'online' : user.status}
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.bio || user.email}</p>
                  </div>
                </div>
                <UserPlus className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            {searchResults.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Conversations
            </div>

            {conversations.map((conv) => {
              const otherUser = conv.participant;
              if (!otherUser) return null;

              const isOnline = isUserOnline(otherUser._id);
              const isActive = activeConversationId === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv._id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-chatdark-card text-white border-l-2 border-brand-500 shadow-sm'
                      : 'hover:bg-chatdark-hover/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Avatar
                      src={otherUser.avatar}
                      name={otherUser.username}
                      size="md"
                      status={isOnline ? 'online' : otherUser.status || 'offline'}
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {otherUser.username}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-[130px]">
                        {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {/* Unread Pill */}
                  {conv.unreadCount > 0 && (
                    <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-1 ring-brand-400">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            {conversations.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No conversations yet. Search for a user above to start chatting!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
