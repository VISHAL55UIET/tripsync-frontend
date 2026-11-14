import { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle, UserCheck } from 'lucide-react';
import { financeApi } from '../../api/financeApi';
import { useAuth } from '../../context/AuthContext';

export default function SettleBalanceModal({ isOpen, onClose, tripId, members, onSettled }) {
  const { user } = useAuth();
  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Current logged-in user ko exclude karke baaki members dikhao
  const eligiblePayees = useMemo(() => {
    return (members || []).filter((m) => m.email !== user?.email);
  }, [members, user?.email]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (eligiblePayees.length > 0) {
        setPayeeId(eligiblePayees[0].userId);
      } else {
        setPayeeId('');
      }
    }
  }, [eligiblePayees, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!payeeId) {
      setError('Please select a trip member to pay.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount < 0.01) {
      setError('Amount must be at least ₹0.01.');
      return;
    }

    setLoading(true);
    try {
      await financeApi.recordSettlement(tripId, {
        payeeId: Number(payeeId),
        amount: Number(numericAmount.toFixed(2)),
        note: note.trim() || null,
      });
      setAmount('');
      setNote('');
      onSettled();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Record Settlement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {eligiblePayees.length === 0 ? (
          <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <p className="text-sm font-medium text-slate-300">No other members in this trip</p>
            <p className="text-xs text-slate-500">
              Invite at least one friend to this trip before recording a settlement payment.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center gap-2.5 text-xs text-indigo-300">
              <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Recording payment from <strong className="text-white">{user?.fullName}</strong> (You)
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Paid To (Recipient) *
              </label>
              <select
                required
                value={payeeId}
                onChange={(e) => setPayeeId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              >
                {eligiblePayees.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                maxLength={500}
                placeholder="e.g., Paid via UPI"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-60"
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}