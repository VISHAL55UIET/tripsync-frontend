import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { financeApi } from '../../api/financeApi';

const CATEGORIES = ['ACCOMMODATION', 'TRANSPORT', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'OTHER'];

export default function AddExpenseModal({ isOpen, onClose, tripId, members, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'FOOD',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL | EXACT
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [customShares, setCustomShares] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && members?.length) {
      setSelectedUserIds(members.map((m) => m.userId));
      const initialShares = {};
      members.forEach((m) => (initialShares[m.userId] = ''));
      setCustomShares(initialShares);
    }
  }, [isOpen, members]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const totalAmount = Number(form.amount);
    if (!totalAmount || totalAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    let splits = [];
    if (splitType === 'EQUAL') {
      if (selectedUserIds.length === 0) {
        setError('Select at least one member to split with.');
        return;
      }
      const baseShare = Math.floor((totalAmount / selectedUserIds.length) * 100) / 100;
      const remainder = Number((totalAmount - baseShare * selectedUserIds.length).toFixed(2));

      splits = selectedUserIds.map((uid, index) => ({
        userId: uid,
        shareAmount: index === 0 ? Number((baseShare + remainder).toFixed(2)) : baseShare,
      }));
    } else {
      splits = members
        .map((m) => ({
          userId: m.userId,
          shareAmount: Number(customShares[m.userId] || 0),
        }))
        .filter((s) => s.shareAmount > 0);

      const sumShares = splits.reduce((acc, s) => acc + s.shareAmount, 0);
      if (Math.abs(sumShares - totalAmount) > 0.05) {
        setError(`Split sum (₹${sumShares.toFixed(2)}) must equal total amount (₹${totalAmount.toFixed(2)}).`);
        return;
      }
    }

    setLoading(true);
    try {
      await financeApi.createExpense(tripId, {
        ...form,
        amount: totalAmount,
        splits,
      });
      onCreated();
      setForm({
        title: '',
        description: '',
        category: 'FOOD',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Add Shared Expense</h2>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="e.g., Hotel Booking / Dinner at Cafe"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expense Date *</label>
            <input
              type="date"
              required
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Split Controls */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-800">Split Between Members</label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    splitType === 'EQUAL' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  Equally
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('EXACT')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    splitType === 'EXACT' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  Exact Amounts
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <span className="text-sm font-medium text-slate-700">{m.fullName}</span>

                  {splitType === 'EQUAL' ? (
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(m.userId)}
                      onChange={() => toggleMember(m.userId)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customShares[m.userId] || ''}
                      onChange={(e) =>
                        setCustomShares({ ...customShares, [m.userId]: e.target.value })
                      }
                      className="w-28 px-2.5 py-1 border border-slate-300 rounded-lg text-sm text-right"
                    />
                  )}
                </div>
              ))}
            </div>
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
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}