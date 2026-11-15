import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  Trash2,
  X,
  Users,
  Trophy,
} from 'lucide-react';
import { workspaceApi } from '../../api/workspaceApi';
import { useAuth } from '../../context/AuthContext';

export default function TripPollsSection({ tripId, canEdit = true }) {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingOptionId, setVotingOptionId] = useState(null);

  // Create Poll Form State
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadPolls = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const data = await workspaceApi.getTripPolls(tripId);
      setPolls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);
  
  useEffect(() => {
    const onLiveUpdate = (e) => {
      if (e.detail?.module === 'POLL') loadPolls();
    };
    window.addEventListener('tripsync:live-update', onLiveUpdate);
    return () => window.removeEventListener('tripsync:live-update', onLiveUpdate);
  }, [loadPolls]);

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAddOptionField = () => {
    if (options.length < 8) setOptions([...options, '']);
  };

  const handleRemoveOptionField = (idx) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setError('');
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) {
      setError('Please enter a poll question.');
      return;
    }
    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 valid options.');
      return;
    }

    setCreating(true);
    try {
      const created = await workspaceApi.createTripPoll(tripId, {
        question: question.trim(),
        options: cleanOptions,
      });
      setPolls((prev) => [created, ...prev]);
      setQuestion('');
      setOptions(['', '']);
      setShowCreate(false);
    } catch (err) {
      setError(err?.message || 'Failed to create poll.');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (votingOptionId) return;
    setVotingOptionId(optionId);
    try {
      const updatedPoll = await workspaceApi.voteTripPoll(tripId, pollId, optionId);
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updatedPoll : p)));
    } catch (err) {
      alert(err?.message || 'Unable to cast vote.');
    } finally {
      setVotingOptionId(null);
    }
  };

  const handleToggleClose = async (pollId) => {
    try {
      const updatedPoll = await workspaceApi.toggleCloseTripPoll(tripId, pollId);
      setPolls((prev) => prev.map((p) => (p.id === pollId ? updatedPoll : p)));
    } catch (err) {
      alert(err?.message || 'Failed to update poll status.');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll permanently?')) return;
    try {
      await workspaceApi.deleteTripPoll(tripId, pollId);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
    } catch (err) {
      alert(err?.message || 'Failed to delete poll.');
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />
      <div className="p-6 space-y-5">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/25 text-fuchsia-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Group Polls & Decisions</h3>
              <p className="text-xs text-slate-400">
                Vote on hotels, routes, food spots & activities together
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setError('');
                setShowCreate((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 transition"
            >
              {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showCreate ? 'Cancel' : 'Create Poll'}</span>
            </button>
          )}
        </div>

        {/* Inline Create Poll Form */}
        {showCreate && (
          <form
            onSubmit={handleCreatePoll}
            className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4"
          >
            {error && (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Poll Question *
              </label>
              <input
                type="text"
                maxLength={300}
                placeholder="e.g., Day 2 Morning: Solang Valley ya Atal Tunnel?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Options (Min 2, Max 8) *
              </label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={200}
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionField(idx)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddOptionField}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another option</span>
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-60 transition"
              >
                {creating ? 'Publishing...' : 'Launch Poll'}
              </button>
            </div>
          </form>
        )}

        {/* Polls Feed */}
        {loading ? (
          <div className="h-28 bg-slate-950/60 rounded-2xl animate-pulse" />
        ) : polls.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-slate-400">No group polls yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a quick poll to decide stays, transport, or sightseeing spots without endless chats.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {polls.map((poll) => {
              const maxVotes = Math.max(...poll.options.map((o) => o.voteCount), 0);
              const isCreator =
                user?.fullName === poll.createdByName || canEdit;

              return (
                <div
                  key={poll.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Poll Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{poll.question}</h4>
                          {poll.closed && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Closed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Asked by <span className="text-slate-300">{poll.createdByName}</span>
                        </p>
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleClose(poll.id)}
                            title={poll.closed ? 'Reopen Poll' : 'Close Voting'}
                            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition"
                          >
                            {poll.closed ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePoll(poll.id)}
                            title="Delete Poll"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Options with Animated Percentage Bars */}
                    <div className="space-y-2">
                      {poll.options.map((opt) => {
                        const isSelected = Number(poll.userVotedOptionId) === Number(opt.id);
                        const isWinner = poll.closed && maxVotes > 0 && opt.voteCount === maxVotes;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={poll.closed || votingOptionId === opt.id}
                            onClick={() => handleVote(poll.id, opt.id)}
                            className={`relative w-full text-left rounded-xl border p-3 overflow-hidden transition ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : isWinner
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                            } ${poll.closed ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {/* Progress Fill */}
                            <div
                              className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                isSelected
                                  ? 'bg-indigo-600/25'
                                  : isWinner
                                  ? 'bg-emerald-500/20'
                                  : 'bg-slate-800/60'
                              }`}
                              style={{ width: `${opt.percentage}%` }}
                            />

                            <div className="relative z-10 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {isWinner ? (
                                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                                ) : (
                                  <CheckCircle2
                                    className={`w-4 h-4 shrink-0 ${
                                      isSelected ? 'text-indigo-400' : 'text-slate-600'
                                    }`}
                                  />
                                )}
                                <span className="text-xs font-semibold text-white truncate">
                                  {opt.optionText}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 text-xs">
                                <span className="text-slate-400">({opt.voteCount})</span>
                                <span className="font-bold text-white w-11 text-right">
                                  {opt.percentage}%
                                </span>
                              </div>
                            </div>

                            {opt.voterNames?.length > 0 && (
                              <p className="relative z-10 text-[10px] text-slate-400 mt-1 pl-6 truncate">
                                {opt.voterNames.join(', ')}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'} cast
                    </span>
                    <span>{poll.closed ? 'Final result locked' : 'Click an option to vote'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}