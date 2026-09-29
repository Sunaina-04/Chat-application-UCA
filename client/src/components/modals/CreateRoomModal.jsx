import React, { useState } from 'react';
import { X, Hash, Lock, Globe } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const CreateRoomModal = () => {
  const { isCreateRoomOpen, setIsCreateRoomOpen, createRoom, activeGroupId, activeGroup } = useChat();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCreateRoomOpen || !activeGroupId) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a room name');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await createRoom(activeGroupId, name.trim(), description.trim(), visibility);
      setName('');
      setDescription('');
      setVisibility('public');
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-chatdark-card border border-chatdark-border rounded-3xl p-6 shadow-2xl animate-slide-up relative">
        <button
          onClick={() => setIsCreateRoomOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-glow-brand">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Create Topic Room</h3>
            <p className="text-xs text-slate-400">in {activeGroup?.name || 'Group'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Room Name *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-500 font-bold">#</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9_-]/g, '')
                  )
                }
                placeholder="e.g. dsa, placements, projects"
                className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Topic
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the focus of this topic room?"
              className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  visibility === 'public'
                    ? 'border-brand-500 bg-brand-950/40 text-brand-300 shadow-sm'
                    : 'border-chatdark-border bg-chatdark-sidebar text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Public</p>
                  <p className="text-[10px] text-slate-400">All group members</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  visibility === 'private'
                    ? 'border-brand-500 bg-brand-950/40 text-brand-300 shadow-sm'
                    : 'border-chatdark-border bg-chatdark-sidebar text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Private</p>
                  <p className="text-[10px] text-slate-400">Invite only</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateRoomOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-chatdark-hover rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-glow-brand transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
