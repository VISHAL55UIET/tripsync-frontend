import { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowRightLeft, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { financeApi } from '../../api/financeApi';
import AddExpenseModal from '../../features/finance/AddExpenseModal';
import SettleUpModal from '../../features/finance/SettleUpModal';

export default function TripFinancePage() {
  const { trip, members, permissions } = useTrip();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const loadBalances = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await financeApi.getBalances(trip.id);
      setBalances(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load balances:', err);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  const totalTripSpend = balances.reduce((acc, b) => acc + (b.totalPaid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Group Spend</p>
            <p className="text-xl font-bold text-slate-900">₹{totalTripSpend.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettleOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Settle Up</span>
          </button>

          {permissions.canEdit && (
            <button
              onClick={() => setExpenseOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Member Balance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Member Balances & Settlements</h2>
          <p className="text-xs text-slate-500">
            Positive net balance means the member gets money back; negative means they owe the group.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading balances...</div>
        ) : balances.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No expenses recorded yet. Click "Add Expense" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5 text-right">Total Paid</th>
                  <th className="px-6 py-3.5 text-right">Total Share</th>
                  <th className="px-6 py-3.5 text-right">Sent</th>
                  <th className="px-6 py-3.5 text-right">Received</th>
                  <th className="px-6 py-3.5 text-right">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balances.map((b) => {
                  const net = Number(b.netBalance || 0);
                  const isPositive = net > 0.009;
                  const isNegative = net < -0.009;

                  return (
                    <tr key={b.userId} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-semibold text-slate-900">{b.fullName}</td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        ₹{Number(b.totalPaid || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700">
                        ₹{Number(b.totalShare || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        ₹{Number(b.settlementsSent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        ₹{Number(b.settlementsReceived || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-700'
                              : isNegative
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
                          {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? `+₹${net.toFixed(2)}` : `₹${net.toFixed(2)}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        tripId={trip.id}
        members={members}
        onCreated={loadBalances}
      />

      <SettleUpModal
        isOpen={settleOpen}
        onClose={() => setSettleOpen(false)}
        tripId={trip.id}
        members={members}
        onSettled={loadBalances}
      />
    </div>
  );
}