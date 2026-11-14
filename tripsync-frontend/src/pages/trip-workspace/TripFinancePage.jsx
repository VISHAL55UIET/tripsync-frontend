import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Scale,
  Wallet,
  Users,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { financeApi } from '../../api/financeApi';
import AddExpenseModal from '../../features/finance/AddExpenseModal';
import SettleBalanceModal from '../../features/finance/SettleBalanceModal';

export default function TripFinancePage() {
  const { trip, members, permissions } = useTrip();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  const loadFinanceData = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const [balRes, expRes, setRes] = await Promise.allSettled([
        financeApi.getBalances(trip.id),
        financeApi.getExpenses(trip.id),
        financeApi.getSettlements(trip.id),
      ]);

      if (balRes.status === 'fulfilled' && Array.isArray(balRes.value)) {
        setBalances(balRes.value);
      }
      if (expRes.status === 'fulfilled' && Array.isArray(expRes.value)) {
        setExpenses(expRes.value);
      }
      if (setRes.status === 'fulfilled' && Array.isArray(setRes.value)) {
        setSettlements(setRes.value);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Total Trip Spend balances ke totalPaid ke sum se nikalega
  const totalTripSpend = balances.reduce((sum, b) => sum + Number(b.totalPaid ?? 0), 0);
  const totalSettled = balances.reduce((sum, b) => sum + Number(b.settlementsSent ?? 0), 0);

  if (loading) {
    return <div className="h-56 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Top KPI Cards & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Trip Spend
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 flex items-center">
              <IndianRupee className="w-5 h-5 text-indigo-400" />
              <span>{totalTripSpend.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Settled
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 flex items-center">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
              <span>{totalSettled.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex items-center justify-end gap-3">
          {permissions.canEdit && (
            <>
              <button
                onClick={() => setSettleModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-xl transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Settle Up</span>
              </button>
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Member Financial Ledger & Net Balances */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Member Balances & Expense Summary</h3>
                <p className="text-xs text-slate-400">
                  Real-time breakdown of amounts paid, shares owed, and net settlements
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {balances.length} Members
            </span>
          </div>

          {balances.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">
              No member balance records available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {balances.map((b) => {
                const net = Number(b.netBalance ?? 0);
                const isPositive = net > 0.01;
                const isNegative = net < -0.01;

                return (
                  <div
                    key={b.userId}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center">
                          {b.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{b.fullName}</p>
                          <p className="text-[11px] text-slate-400">Member ID #{b.userId}</p>
                        </div>
                      </div>

                      {isPositive && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 rounded-full">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Gets ₹{net.toFixed(2)}
                        </span>
                      )}
                      {isNegative && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-500/15 border border-rose-500/25 px-3 py-1 rounded-full">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Owes ₹{Math.abs(net).toFixed(2)}
                        </span>
                      )}
                      {!isPositive && !isNegative && (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                          Settled (₹0.00)
                        </span>
                      )}
                    </div>

                    {/* 4-Metric Mini Grid from MemberBalanceResponse */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center">
                      <div className="bg-slate-900/90 rounded-xl p-2">
                        <p className="text-[10px] uppercase text-slate-500 font-semibold">Paid</p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          ₹{Number(b.totalPaid ?? 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 rounded-xl p-2">
                        <p className="text-[10px] uppercase text-slate-500 font-semibold">Share</p>
                        <p className="text-xs font-bold text-indigo-300 mt-0.5">
                          ₹{Number(b.totalShare ?? 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 rounded-xl p-2">
                        <p className="text-[10px] uppercase text-slate-500 font-semibold">Sent</p>
                        <p className="text-xs font-bold text-emerald-300 mt-0.5">
                          ₹{Number(b.settlementsSent ?? 0).toFixed(0)}
                        </p>
                      </div>
                      <div className="bg-slate-900/90 rounded-xl p-2">
                        <p className="text-[10px] uppercase text-slate-500 font-semibold">Received</p>
                        <p className="text-xs font-bold text-amber-300 mt-0.5">
                          ₹{Number(b.settlementsReceived ?? 0).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Optional Expenses & Settlements Lists (jab backend GET endpoints add honge tab auto-populate honge) */}
      {(expenses.length > 0 || settlements.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {expenses.length > 0 && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-base font-bold text-white pb-4 border-b border-slate-800">
                Expense Transactions ({expenses.length})
              </h3>
              <div className="divide-y divide-slate-800/80 mt-2">
                {expenses.map((exp) => (
                  <div key={exp.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">{exp.title}</p>
                      <p className="text-xs text-slate-400">
                        {exp.category} • {exp.expenseDate}
                      </p>
                    </div>
                    <span className="font-bold text-white">₹{Number(exp.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settlements.length > 0 && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-base font-bold text-white pb-4 border-b border-slate-800">
                Settlement History ({settlements.length})
              </h3>
              <div className="divide-y divide-slate-800/80 mt-2">
                {settlements.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                    <p className="text-slate-200">
                      <strong>{s.paidByName}</strong> paid <strong>{s.paidToName}</strong>
                    </p>
                    <span className="font-bold text-emerald-400">
                      ₹{Number(s.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        tripId={trip.id}
        members={members}
        onAdded={loadFinanceData}
      />

      <SettleBalanceModal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        tripId={trip.id}
        members={members}
        onSettled={loadFinanceData}
      />
    </div>
  );
}