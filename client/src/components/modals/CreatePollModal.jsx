import React, { useState } from 'react';
import { X, BarChart2, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const CreatePollModal = () => {
  const {
    isCreatePollOpen,
    setIsCreatePollOpen,
    createPoll,
    activeRoom,
    activeConversation,
    currentView,
  } = useChat();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCreatePollOpen) return null;

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (text, index) => {
    const updated = [...options];
    updated[index] = text;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      setError('Please provide a poll question');
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 non-empty poll options');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await createPoll({
        question: cleanQuestion,
        options: cleanOptions,
        isMultipleChoice,
        isAnonymous,
      });

      // Reset
      setQuestion('');
      setOptions(['', '']);
      setIsMultipleChoice(false);
      setIsAnonymous(false);
      setIsCreatePollOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setIsLoading(false);
    }
  };

  const channelLabel =
    currentView === 'groups'
      ? `#${activeRoom?.name || 'room'}`
      : `@${activeConversation?.participant?.username || 'direct-chat'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-chatdark-card border border-chatdark-border rounded-3xl p-6 shadow-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsCreatePollOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shadow-glow-brand">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Create Live Poll</h3>
            <p className="text-xs text-slate-400">Share with members in {channelLabel}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Question <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which deployment target should we pick?"
              className="w-full px-4 py-2.5 bg-chatdark-input border border-chatdark-border rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Options (2 to 6) <span className="text-rose-400">*</span>
            </label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-6 text-center text-xs font-bold text-slate-500">
                    {idx + 1}.
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(e.target.value, idx)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3.5 py-2 bg-chatdark-input border border-chatdark-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors px-2 py-1 rounded-lg hover:bg-brand-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Option ({options.length}/6)
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-chatdark-border space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isMultipleChoice}
                onChange={(e) => setIsMultipleChoice(e.target.checked)}
                className="w-4 h-4 rounded border-chatdark-border bg-chatdark-input text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span>Allow multiple choices (voters can pick multiple options)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-chatdark-border bg-chatdark-input text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span>Anonymous poll (hide voter names from members)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreatePollOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-2xl shadow-glow-brand transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating Poll...' : '📊 Launch Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
