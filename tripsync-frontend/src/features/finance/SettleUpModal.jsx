import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { financeApi } from '../../api/financeApi';
import { useAuth } from '../../context/AuthContext';

export default function SettleUpModal({ isOpen, onClose, tripId, members, onSettled }) {
  const { user } = useAuth();
  const eligiblePayees = members.filter((m) => m.email !== user?.email);

  const [form, setForm] = useState({
    payeeId: eligiblePayees[0]?.userId || '',
    amount: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.payeeId) {
      setError('Select a member to pay.');
      return;
    }
    setLoading(true);
    try {
      await financeApi.createSettlement(tripId, {
        payeeId: Number(form.payeeId),
        amount: Number(form.amount),
        note: form.note,
      });
      onSettled();
      setForm({ payeeId: eligiblePayees[0]?.userId || '', amount: '', note: '' });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to record settlement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Record a Settlement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paid To (Payee) *</label>
            <select
              required
              value={form.payeeId}
              onChange={(e) => setForm({ ...form, payeeId: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select member...</option>
              {eligiblePayees.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid (₹) *</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
            <input
              type="text"
              maxLength={500}
              placeholder="e.g., UPI transfer for hotel split"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-60"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}