import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { financeApi } from '../../api/financeApi';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'STAY', 'ACTIVITY', 'SHOPPING', 'OTHER'];

export default function AddExpenseModal({ isOpen, onClose, tripId, members, onAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState('EQUAL');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [exactAmounts, setExactAmounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (members?.length > 0) {
      setSelectedUserIds(members.map((m) => m.userId));
      const initialExact = {};
      members.forEach((m) => {
        initialExact[m.userId] = '';
      });
      setExactAmounts(initialExact);
    }
  }, [members, isOpen]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const totalAmt = parseFloat(amount);
    if (!totalAmt || totalAmt <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    let splits = [];
    if (splitType === 'EQUAL') {
      if (selectedUserIds.length === 0) {
        setError('Select at least one member to split with.');
        return;
      }
      const count = selectedUserIds.length;
      const baseShare = Math.floor((totalAmt / count) * 100) / 100;
      const remainder = Number((totalAmt - baseShare * count).toFixed(2));

      splits = selectedUserIds.map((uid, idx) => ({
        userId: Number(uid),
        shareAmount: idx === 0 ? Number((baseShare + remainder).toFixed(2)) : baseShare,
      }));
    } else {
      let sum = 0;
      members.forEach((m) => {
        const val = parseFloat(exactAmounts[m.userId]);
        if (val > 0) {
          sum += val;
          splits.push({ userId: Number(m.userId), shareAmount: val });
        }
      });
      if (splits.length === 0 || Math.abs(sum - totalAmt) > 0.01) {
        setError(
          `Exact split sum (₹${sum.toFixed(2)}) must equal total amount (₹${totalAmt.toFixed(2)}).`
        );
        return;
      }
    }

    setLoading(true);
    try {
      await financeApi.addExpense(tripId, {
        title: title.trim(),
        description: description.trim() || null,
        category,
        amount: Number(totalAmt.toFixed(2)),
        expenseDate,
        splits,
      });
      setTitle('');
      setDescription('');
      setAmount('');
      onAdded();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 text-slate-100 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Add Group Expense</h2>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="e.g., Dinner at Cafe 1947"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              maxLength={1000}
              placeholder="Any extra details about this bill..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Split Method *</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              {['EQUAL', 'EXACT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    splitType === type
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'EQUAL' ? 'Split Equally' : 'Exact Amounts'}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto bg-slate-950/60">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-200">{m.fullName}</span>
                {splitType === 'EQUAL' ? (
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(m.userId)}
                    onChange={() => toggleMember(m.userId)}
                    className="w-4 h-4 accent-indigo-500 rounded"
                  />
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={exactAmounts[m.userId] || ''}
                    onChange={(e) =>
                      setExactAmounts({ ...exactAmounts, [m.userId]: e.target.value })
                    }
                    className="w-28 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right text-sm text-white outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            ))}
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
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}