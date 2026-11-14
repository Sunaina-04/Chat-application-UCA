import React from 'react';
import {
  BarChart2,
  CheckCircle2,
  Circle,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  Users,
  Trophy,
} from 'lucide-react';

export const PollCard = ({ message, poll, onVote, onClose, currentUserId }) => {
  if (!poll) return null;

  const isClosed = Boolean(poll.isClosed);
  const totalVotes = poll.totalVotes || 0;
  const isMultipleChoice = Boolean(poll.isMultipleChoice);
  const isAnonymous = Boolean(poll.isAnonymous);
  const isCreator = currentUserId === message.senderId;

  // Find max votes to highlight leading option(s)
  const maxVotes = Math.max(0, ...(poll.options || []).map((o) => o.votes?.length || 0));

  return (
    <div className="my-2.5 max-w-xl w-full bg-chatdark-card/95 border border-chatdark-border rounded-2xl p-4 shadow-lg backdrop-blur-md transition-all select-none">
      {/* Poll Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 flex-shrink-0 mt-0.5">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 leading-snug">
              {poll.question}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                {isMultipleChoice ? 'Multiple Choice' : 'Single Choice'}
              </span>
              {isAnonymous && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Anonymous
                </span>
              )}
              {isClosed ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Closed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Unlock className="w-2.5 h-2.5" /> Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2 mt-3">
        {(poll.options || []).map((opt) => {
          const voteCount = opt.votes?.length || 0;
          const percentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const hasVotedForThis = opt.votes?.some((v) => v.userId === currentUserId);
          const isLeader = maxVotes > 0 && voteCount === maxVotes;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isClosed}
              onClick={() => onVote && onVote(message._id, opt.id)}
              className={`w-full relative overflow-hidden rounded-xl border p-2.5 text-left transition-all group ${
                hasVotedForThis
                  ? 'border-brand-500/70 bg-brand-950/20 shadow-glow-brand'
                  : 'border-chatdark-border bg-chatdark-input/60 hover:border-slate-600'
              } ${isClosed ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}`}
            >
              {/* Progress bar background fill */}
              <div
                className={`absolute inset-0 transition-all duration-500 ease-out pointer-events-none ${
                  hasVotedForThis
                    ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/20'
                    : isLeader && totalVotes > 0
                    ? 'bg-gradient-to-r from-emerald-600/20 to-teal-500/10'
                    : 'bg-slate-700/20'
                }`}
                style={{ width: `${percentage}%` }}
              />

              {/* Option content */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Radio / Checkbox indicator */}
                  <div className="flex-shrink-0 text-slate-400 group-hover:text-brand-400 transition-colors">
                    {isMultipleChoice ? (
                      hasVotedForThis ? (
                        <CheckSquare className="w-4 h-4 text-brand-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )
                    ) : hasVotedForThis ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <span
                    className={`text-xs font-semibold truncate ${
                      hasVotedForThis ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {opt.text}
                  </span>

                  {isLeader && totalVotes > 0 && (
                    <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" title="Leading Choice" />
                  )}
                </div>

                {/* Vote stats */}
                <div className="flex items-center gap-2 flex-shrink-0 font-mono text-xs">
                  <span className="text-slate-400 font-medium">
                    {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                  </span>
                  <span
                    className={`font-bold ${
                      hasVotedForThis ? 'text-brand-400' : 'text-slate-300'
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Voter names chip list (if non-anonymous) */}
              {!isAnonymous && opt.votes && opt.votes.length > 0 && (
                <div className="relative z-10 mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span className="truncate max-w-sm">
                    {opt.votes.map((v) => v.username || 'User').join(', ')}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-chatdark-border flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {totalVotes} {totalVotes === 1 ? 'total participant' : 'total participants'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCreator && !isClosed && (
            <button
              type="button"
              onClick={() => onClose && onClose(message._id)}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-colors"
            >
              Close Poll
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
