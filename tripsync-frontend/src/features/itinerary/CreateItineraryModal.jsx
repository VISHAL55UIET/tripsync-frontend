import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { itineraryApi } from '../../api/itineraryApi';

export default function CreateItineraryModal({ isOpen, onClose, tripId, trip, editData, onSaved }) {
  const [form, setForm] = useState({ date: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date || '',
        note: editData.notes || editData.note || '',
      });
    } else {
      setForm({ date: trip?.startDate || '', note: '' });
    }
  }, [editData, trip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editData) {
        await itineraryApi.updateItinerary(tripId, editData.id, form);
      } else {
        await itineraryApi.createItinerary(tripId, form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save itinerary day.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {editData ? 'Edit Day Plan' : 'Add Itinerary Day'}
          </h2>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              min={trip?.startDate}
              max={trip?.endDate}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Day Notes / Theme</label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="e.g., Arrival, check-in, and Old Manali cafe hopping"
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
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}