import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { itineraryApi } from '../../api/itineraryApi';

export default function ActivityModal({
  isOpen,
  onClose,
  tripId,
  itineraryId,
  editData,
  defaultOrder = 1,
  onSaved,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '09:00',
    endTime: '11:00',
    estimatedCost: '',
    displayOrder: defaultOrder,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        description: editData.description || '',
        location: editData.location || '',
        startTime: editData.startTime?.slice(0, 5) || '09:00',
        endTime: editData.endTime?.slice(0, 5) || '11:00',
        estimatedCost: editData.estimatedCost ?? '',
        displayOrder: editData.displayOrder ?? defaultOrder,
      });
    } else {
      setForm({
        title: '',
        description: '',
        location: '',
        startTime: '09:00',
        endTime: '11:00',
        estimatedCost: '',
        displayOrder: defaultOrder,
      });
    }
    setError('');
  }, [editData, defaultOrder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.endTime <= form.startTime) {
      setError('End time must be after start time.');
      return;
    }

    const payload = {
      ...form,
      startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
      estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : 0,
      displayOrder: parseInt(form.displayOrder, 10) || 1,
    };

    setLoading(true);
    try {
      if (editData) {
        await itineraryApi.updateActivity(tripId, itineraryId, editData.id, payload);
      } else {
        await itineraryApi.addActivity(tripId, itineraryId, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 text-slate-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {editData ? 'Edit Activity' : 'Add Activity'}
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
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="e.g., Visit Hadimba Temple"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <input
                type="text"
                maxLength={250}
                placeholder="e.g., Old Manali"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Est. Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              maxLength={1000}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              {loading ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}