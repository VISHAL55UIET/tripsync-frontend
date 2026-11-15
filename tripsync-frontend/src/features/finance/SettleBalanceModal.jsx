import { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle, UserCheck, CreditCard, CheckCircle2, Info } from 'lucide-react';
import { financeApi } from '../../api/financeApi';
import { useAuth } from '../../context/AuthContext';

export default function SettleBalanceModal({
  isOpen,
  onClose,
  tripId,
  members,
  initialSettlement,
  onSettled,
}) {
  const { user } = useAuth();
  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [error, setError] = useState('');

  const eligiblePayees = useMemo(() => {
    return (members || []).filter((m) => m.email !== user?.email);
  }, [members, user?.email]);

  const currentUserMember = useMemo(() => {
    return (members || []).find((m) => m.email === user?.email);
  }, [members, user?.email]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialSettlement) {
        const matchedPayee = eligiblePayees.find(
          (m) => Number(m.userId) === Number(initialSettlement.toUserId)
        );
        setPayeeId(
          matchedPayee
            ? matchedPayee.userId
            : eligiblePayees.length > 0
            ? eligiblePayees[0].userId
            : ''
        );
        setAmount(
          initialSettlement.amount != null ? Number(initialSettlement.amount).toFixed(2) : ''
        );
        setNote(`Simplified settlement to ${initialSettlement.toUserName}`);
      } else {
        setPayeeId(eligiblePayees.length > 0 ? eligiblePayees[0].userId : '');
        setAmount('');
        setNote('');
      }
    }
  }, [eligiblePayees, initialSettlement, isOpen]);

  if (!isOpen) return null;

  const isDifferentPayer =
    initialSettlement &&
    currentUserMember &&
    Number(initialSettlement.fromUserId) !== Number(currentUserMember.userId);

  const validateInputs = (minAmount = 0.01) => {
    setError('');
    if (!payeeId) {
      setError('Please select a trip member to pay.');
      return null;
    }
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount < minAmount) {
      setError(`Amount must be at least ₹${minAmount.toFixed(2)}.`);
      return null;
    }
    return Number(numericAmount.toFixed(2));
  };

  // 1. Offline / Manual Settlement
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const validAmount = validateInputs(0.01);
    if (!validAmount) return;

    setLoading(true);
    try {
      await financeApi.recordSettlement(tripId, {
        payeeId: Number(payeeId),
        amount: validAmount,
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

  // 2. Online Razorpay Settlement
  const handleRazorpayPay = async () => {
    const validAmount = validateInputs(1.0);
    if (!validAmount) return;

    if (!window.Razorpay) {
      setError('Razorpay SDK failed to load. Check your internet connection or index.html.');
      return;
    }

    setRazorpayLoading(true);
    try {
      const orderData = await financeApi.createRazorpayOrder(tripId, {
        payeeId: Number(payeeId),
        amount: validAmount,
        note: note.trim() || null,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'TripSync',
        description: `Settlement to ${orderData.payeeName}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async (response) => {
          try {
            await financeApi.verifyRazorpayPayment(tripId, {
              payeeId: Number(payeeId),
              amount: validAmount,
              note: note.trim() || null,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setAmount('');
            setNote('');
            onSettled();
            onClose();
          } catch (verifyErr) {
            setError(verifyErr?.message || 'Payment verification failed on server.');
          } finally {
            setRazorpayLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setRazorpayLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(resp?.error?.description || 'Razorpay payment failed.');
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err?.message || 'Unable to initiate Razorpay checkout.');
      setRazorpayLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Settle Up Balance</h2>
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

        {isDifferentPayer && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Note: This simplified debt is owed by{' '}
              <strong>{initialSettlement.fromUserName}</strong>, but submitting here will record a
              payment from your account ({user?.fullName}).
            </span>
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
          <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center gap-2.5 text-xs text-indigo-300">
              <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Paying from <strong className="text-white">{user?.fullName}</strong> (You)
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
                placeholder="e.g., Hotel & cab split"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="pt-2 space-y-2.5">
              {/* Online Razorpay Button */}
              <button
                type="button"
                disabled={loading || razorpayLoading}
                onClick={handleRazorpayPay}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-60 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>{razorpayLoading ? 'Opening Razorpay...' : 'Pay Online via Razorpay'}</span>
              </button>

              {/* Manual Offline Record Button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || razorpayLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-300 rounded-xl disabled:opacity-60 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{loading ? 'Recording...' : 'Record Cash / Manual UPI'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}