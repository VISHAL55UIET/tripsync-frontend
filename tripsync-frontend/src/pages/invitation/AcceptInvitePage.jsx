import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MailOpen, Check, X, AlertCircle } from 'lucide-react';
import { tripApi } from '../../api/tripApi';

export default function AcceptInvitePage() {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (action === 'accept') {
        await tripApi.acceptInvitation(tripId, token);
        navigate(`/trips/${tripId}`);
      } else {
        await tripApi.rejectInvitation(tripId, token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.message || 'Invitation has expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MailOpen className="w-7 h-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">You're Invited to a Trip!</h1>
      <p className="text-sm text-slate-500 mt-2">
        Accept this invitation to join Trip #{tripId}, collaborate on the itinerary, and split expenses.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 justify-center mt-6">
        <button
          disabled={loading}
          onClick={() => handleAction('reject')}
          className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          <span>Decline</span>
        </button>
        <button
          disabled={loading}
          onClick={() => handleAction('accept')}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? 'Processing...' : 'Accept Invite'}</span>
        </button>
      </div>
    </div>
  );
}