import React, { useState } from 'react';
import {
  Smile,
  Reply,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
  CornerDownRight,
  MessageCircle,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '😂', '💡', '💯'];

export const MessageItem = ({ message, onReply, isHighlighted = false }) => {
  const { user } = useAuth();
  const { editMessage, deleteMessage, toggleReaction, openThread } = useChat();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isSender = message.senderId === user?._id;
  const isDeleted = message.isDeletedForEveryone;

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage(message._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group reactions by emoji
  const reactionMap = {};
  (message.reactions || []).forEach((r) => {
    if (!reactionMap[r.emoji]) {
      reactionMap[r.emoji] = { count: 0, hasReacted: false, users: [] };
    }
    reactionMap[r.emoji].count += 1;
    reactionMap[r.emoji].users.push(r.username || 'User');
    if (r.userId === user?._id) {
      reactionMap[r.emoji].hasReacted = true;
    }
  });

  return (
    <div
      className={`group relative flex gap-3 px-4 py-1.5 transition-colors rounded-xl mx-2 ${
        isHighlighted ? 'bg-brand-950/40 border border-brand-500/30' : 'hover:bg-chatdark-hover/40'
      }`}
    >
      {/* Sender Avatar */}
      <Avatar
        src={message.sender?.avatar}
        name={message.sender?.username || 'User'}
        size="md"
        className="mt-0.5"
      />

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Thread Reference / Parent Quote Preview */}
        {message.parentMessage && (
          <div
            onClick={() => onReply(message.parentMessage)}
            className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 cursor-pointer hover:text-slate-200 transition-colors"
          >
            <CornerDownRight className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-semibold text-slate-300">
              @{message.parentMessage.sender?.username || 'User'}
            </span>
            <span className="truncate max-w-sm italic text-slate-400">
              "{message.parentMessage.content}"
            </span>
          </div>
        )}

        {/* Sender Header */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200 hover:underline cursor-pointer">
            {message.sender?.username || 'User'}
          </span>
          <span className="text-[11px] text-slate-500">{formatTime(message.createdAt)}</span>
          {message.isEdited && !isDeleted && (
            <span className="text-[10px] text-slate-500 italic">(edited)</span>
          )}
        </div>

        {/* Content or Edit Box */}
        {isEditing ? (
          <div className="mt-1">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-chatdark-card text-sm text-slate-100 px-3 py-1.5 rounded-lg border border-brand-500 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>escape to <button onClick={() => setIsEditing(false)} className="text-brand-400 hover:underline">cancel</button></span>
              <span>•</span>
              <span>enter to <button onClick={handleSaveEdit} className="text-brand-400 hover:underline">save</button></span>
            </div>
          </div>
        ) : (
          <p
            className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${
              isDeleted ? 'italic text-slate-500 select-none' : 'text-slate-200'
            }`}
          >
            {message.content}
          </p>
        )}

        {/* Attachments Preview if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((att, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-chatdark-border bg-chatdark-card p-1">
                {att.url && att.url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                  <img src={att.url} alt="Attachment" className="max-w-xs max-h-60 rounded-lg object-cover" />
                ) : (
                  <div className="p-2 text-xs text-slate-300">{att.name || 'File Attachment'}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions Chips */}
        {Object.keys(reactionMap).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {Object.entries(reactionMap).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(message._id, emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs border transition-all ${
                  data.hasReacted
                    ? 'bg-brand-950/80 border-brand-500/60 text-brand-300 font-semibold shadow-sm'
                    : 'bg-chatdark-card border-chatdark-border text-slate-300 hover:bg-chatdark-hover'
                }`}
                title={data.users.join(', ')}
              >
                <span>{emoji}</span>
                <span>{data.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread replies footer button if message has replies */}
        {message.replyCount > 0 && (
          <button
            onClick={() => openThread(message)}
            className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>
              {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </button>
        )}
      </div>

      {/* Hover Floating Action Bar */}
      {!isDeleted && (
        <div className="absolute right-4 -top-3.5 hidden group-hover:flex items-center gap-0.5 bg-chatdark-card border border-chatdark-border rounded-xl p-0.5 shadow-lg backdrop-blur-md z-10 animate-fade-in">
          {/* Quick Reaction Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-chatdark-hover rounded-lg transition-colors"
              title="Add Reaction"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && (
              <div className="absolute right-0 bottom-8 flex items-center gap-1 bg-chatdark-card border border-chatdark-border p-1.5 rounded-xl shadow-xl z-50 animate-slide-up">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      toggleReaction(message._id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1 hover:scale-125 transition-transform text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply Button (starts reply context and opens thread drawer) */}
          <button
            onClick={() => {
              onReply(message);
              openThread(message);
            }}
            className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-chatdark-hover rounded-lg transition-colors"
            title="Reply in Thread"
          >
            <Reply className="w-4 h-4" />
          </button>

          {/* Edit (only if author) */}
          {isSender && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-chatdark-hover rounded-lg transition-colors"
              title="Edit Message"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* More / Delete Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-chatdark-hover rounded-lg transition-colors"
              title="More"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-44 glass-dropdown rounded-xl p-1 z-50 shadow-xl animate-slide-up">
                {isSender && (
                  <button
                    onClick={() => {
                      deleteMessage(message._id, true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete for everyone</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteMessage(message._id, false);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-chatdark-hover rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete for me</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
