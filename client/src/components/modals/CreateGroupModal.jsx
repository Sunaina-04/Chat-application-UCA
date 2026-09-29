import React, { useState } from 'react';
import { X, Users, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const PRESET_ICONS = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
];

export const CreateGroupModal = () => {
  const { isCreateGroupOpen, setIsCreateGroupOpen, createGroup } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_ICONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCreateGroupOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a group name');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await createGroup(name.trim(), description.trim(), image);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-chatdark-card border border-chatdark-border rounded-3xl p-6 shadow-2xl animate-slide-up relative">
        <button
          onClick={() => setIsCreateGroupOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shadow-glow-brand">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Create a New Group</h3>
            <p className="text-xs text-slate-400">Bring friends or classmates together</p>
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
              Group Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. College CSE, Hackathon Team"
              className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group all about?"
              className="w-full bg-chatdark-sidebar border border-chatdark-border focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Group Avatar
            </label>
            <div className="flex items-center gap-3">
              {PRESET_ICONS.map((icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(icon)}
                  className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all ${
                    image === icon ? 'border-brand-500 scale-105 shadow-glow-brand' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={icon} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-chatdark-hover rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-glow-brand transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
