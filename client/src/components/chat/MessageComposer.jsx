import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';

const EMOJI_PALETTE = [
  '😀', '😂', '🔥', '🚀', '❤️', '👍', '🎉', '💯',
  '🙌', '✨', '💡', '🤔', '👀', '😎', '💻', '⭐',
  '🤖', '💪', '🎯', '✅', '⚡', '☕', '🧠', '🍻'
];

export const MessageComposer = ({ replyingTo, onCancelReply, placeholder = 'Type a message...' }) => {
  const { sendMessage, activeRoom, activeConversation, currentView } = useChat();
  const { emitTypingStart, emitTypingStop } = useSocket();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);

  const getTargetChannel = () => {
    if (currentView === 'groups') {
      return { roomId: activeRoom?._id, conversationId: null };
    }
    return { roomId: null, conversationId: activeConversation?._id };
  };

  const handleTextChange = (e) => {
    setText(e.target.value);

    // Emit typing indicator
    const target = getTargetChannel();
    emitTypingStart(target);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitTypingStop(target);
    }, 2000);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    sendMessage({
      content: trimmed,
      parentMessageId: replyingTo ? replyingTo._id : null,
      attachments,
    });

    setText('');
    setAttachments([]);
    if (onCancelReply) onCancelReply();

    const target = getTargetChannel();
    emitTypingStop(target);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSampleImage = () => {
    // Add a demo attachment
    const demoImgs = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    ];
    const randomImg = demoImgs[Math.floor(Math.random() * demoImgs.length)];
    setAttachments((prev) => [...prev, { url: randomImg, name: 'project-architecture.png', fileType: 'image/png' }]);
  };

  return (
    <div className="p-3 bg-chatdark-sidebar/60 border-t border-chatdark-border select-none">
      {/* Replying banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-brand-950/60 border border-brand-500/30 rounded-xl text-xs text-brand-300 animate-slide-up">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-200">
              Replying to @{replyingTo.sender?.username || 'User'}:
            </span>
            <span className="truncate italic text-slate-400">"{replyingTo.content}"</span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-brand-500/40">
              <img src={att.url} alt="Uploaded" className="w-16 h-16 object-cover" />
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer Input Bar */}
      <div className="relative flex items-center bg-chatdark-card border border-chatdark-border focus-within:border-brand-500/80 rounded-2xl p-1.5 shadow-sm transition-all">
        {/* Attachment Demo Button */}
        <button
          onClick={handleSampleImage}
          className="p-2 text-slate-400 hover:text-brand-400 hover:bg-chatdark-hover rounded-xl transition-colors"
          title="Add Image Attachment"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={
            replyingTo
              ? `Reply to @${replyingTo.sender?.username || 'User'}...`
              : currentView === 'groups'
              ? `Message #${activeRoom?.name || 'room'}`
              : `Message @${activeConversation?.participant?.username || 'user'}`
          }
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 px-3 py-1.5 focus:outline-none resize-none max-h-32 min-h-[38px] leading-relaxed"
        />

        {/* Emoji Button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-chatdark-hover rounded-xl transition-colors"
            title="Emoji Picker"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showEmojiPicker && (
            <div className="absolute right-0 bottom-12 w-64 glass-dropdown rounded-2xl p-2.5 z-50 shadow-2xl animate-slide-up grid grid-cols-6 gap-1.5 text-xl">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="p-1 hover:scale-125 transition-transform flex items-center justify-center rounded-lg hover:bg-chatdark-hover"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && attachments.length === 0}
          className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:hover:bg-brand-600 text-white rounded-xl transition-all shadow-glow-brand hover:scale-105 active:scale-95 ml-1"
          title="Send (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
