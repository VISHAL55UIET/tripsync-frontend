import { useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import {
  MailCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { tripApi } from '../../api/tripApi';
import { useAuth } from '../../context/AuthContext';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const { tripId: paramTripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialTripId = paramTripId || searchParams.get('tripId') || '';
  const initialToken = searchParams.get('token') || '';

  const [tripId, setTripId] = useState(initialTripId);
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'accepted' | 'rejected'
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    setError('');
    if (!tripId || !token.trim()) {
      setError('Both Trip ID and Invitation Token are required.');
      return;
    }

    setLoading(true);
    try {
      if (action === 'ACCEPT') {
        await tripApi.acceptInvitation(tripId, token.trim());
        setStatusType('accepted');
        setStatusMessage('Invitation accepted! You are now a member of this trip.');
        setTimeout(() => navigate(`/trips/${tripId}`), 1500);
      } else {
        await tripApi.rejectInvitation(tripId, token.trim());
        setStatusType('rejected');
        setStatusMessage('Invitation declined.');
      }
    } catch (err) {
      setError(
        err?.message ||
          'Failed to process invitation. Make sure you are logged in with the invited email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-white font-bold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span>TripSync</span>
            </Link>
            {user?.email && (
              <span className="text-xs text-slate-400 truncate max-w-[180px]">{user.email}</span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center shrink-0">
              <MailCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Trip Invitation</h1>
              <p className="text-xs text-slate-400">
                Review and respond to your trip collaboration invite
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage ? (
            <div
              className={`p-4 rounded-xl border text-sm space-y-3 ${
                statusType === 'accepted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <p className="font-semibold">{statusMessage}</p>
              <Link
                to={statusType === 'accepted' ? `/trips/${tripId}` : '/dashboard'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                <span>{statusType === 'accepted' ? 'Open Trip Workspace' : 'Back to Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {!initialTripId && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Trip ID *</label>
                  <input
                    type="number"
                    placeholder="e.g., 1"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Invitation Token *
                </label>
                <input
                  type="text"
                  placeholder="Paste token from your invitation email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Check the invitation email sent to{' '}
                  <strong className="text-slate-300">{user?.email}</strong> for your secure link/token.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('REJECT')}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-xl transition disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('ACCEPT')}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Processing...' : 'Accept Invite'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}