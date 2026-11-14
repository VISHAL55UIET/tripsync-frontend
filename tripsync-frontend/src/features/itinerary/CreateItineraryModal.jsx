import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { itineraryApi } from '../../api/itineraryApi';

export default function CreateItineraryModal({
  isOpen,
  onClose,
  tripId,
  trip,
  editData,
  onSaved,
}) {
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setDate(editData.date || '');
      // Response DTO me 'notes' aata hai
      setNote(editData.notes || '');
    } else {
      setDate(trip?.startDate || '');
      setNote('');
    }
    setError('');
  }, [editData, trip, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Request DTO me backend 'note' (singular) expect karta hai
      const payload = { date, note: note.trim() || null };
      if (editData) {
        await itineraryApi.updateItinerary(tripId, editData.id, payload);
      } else {
        await itineraryApi.createItinerary(tripId, payload);
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {editData ? 'Edit Itinerary Day' : 'Add Itinerary Day'}
          </h2>
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
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
            <input
              type="date"
              required
              min={trip?.startDate}
              max={trip?.endDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Must be within {trip?.startDate} and {trip?.endDate}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Day Notes</label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="e.g., Arrival & Old Town exploration"
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
              className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Day'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}