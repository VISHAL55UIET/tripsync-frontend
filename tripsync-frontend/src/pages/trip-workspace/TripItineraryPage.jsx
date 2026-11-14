import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  IndianRupee,
  Navigation,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { itineraryApi } from '../../api/itineraryApi';
import CreateItineraryModal from '../../features/itinerary/CreateItineraryModal';
import ActivityModal from '../../features/itinerary/ActivityModal';

export default function TripItineraryPage() {
  const { trip, permissions } = useTrip();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dayModal, setDayModal] = useState({ open: false, editData: null });
  const [activityModal, setActivityModal] = useState({
    open: false,
    itineraryId: null,
    editData: null,
    defaultOrder: 1,
  });

  const loadItineraries = useCallback(async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await itineraryApi.getItineraries(trip.id);
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      setItineraries(sorted);
    } catch (err) {
      console.error('Failed to load itineraries:', err);
    } finally {
      setLoading(false);
    }
  }, [trip?.id]);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  const totalEstimatedBudget = useMemo(() => {
    return itineraries.reduce((sum, day) => {
      const dayTotal = (day.activities || []).reduce(
        (acc, act) => acc + Number(act.estimatedCost || 0),
        0
      );
      return sum + dayTotal;
    }, 0);
  }, [itineraries]);

  const handleDeleteDay = async (itineraryId) => {
    if (!window.confirm('Delete this entire day and all its activities?')) return;
    try {
      await itineraryApi.deleteItinerary(trip.id, itineraryId);
      loadItineraries();
    } catch (err) {
      alert(err?.message || 'Failed to delete day.');
    }
  };

  const handleDeleteActivity = async (itineraryId, activityId) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await itineraryApi.deleteActivity(trip.id, itineraryId, activityId);
      loadItineraries();
    } catch (err) {
      alert(err?.message || 'Failed to delete activity.');
    }
  };

  if (loading) {
    return <div className="h-56 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Budget Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white">Day-by-Day Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {itineraries.length} {itineraries.length === 1 ? 'day' : 'days'} planned • Est.
            Activity Budget:{' '}
            <strong className="text-emerald-400">₹{totalEstimatedBudget.toFixed(2)}</strong>
          </p>
        </div>

        {permissions.canEdit && (
          <button
            onClick={() => setDayModal({ open: true, editData: null })}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Itinerary Day</span>
          </button>
        )}
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white">Your itinerary is a blank canvas</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            Add days between <strong className="text-slate-200">{trip.startDate}</strong> and{' '}
            <strong className="text-slate-200">{trip.endDate}</strong> to map out flights,
            sightseeing, and reservations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {itineraries.map((day, idx) => {
            const activities = [...(day.activities || [])].sort(
              (a, b) =>
                (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
                a.startTime.localeCompare(b.startTime)
            );

            return (
              <div
                key={day.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden"
              >
                <div className="bg-slate-950/70 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs flex flex-col items-center justify-center">
                      <span className="text-[9px] uppercase opacity-80">Day</span>
                      <span className="text-sm leading-none">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>{day.date}</span>
                      </h3>
                      {day.notes && <p className="text-xs text-slate-400 mt-0.5">{day.notes}</p>}
                    </div>
                  </div>

                  {permissions.canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setActivityModal({
                            open: true,
                            itineraryId: day.id,
                            editData: null,
                            defaultOrder: activities.length + 1,
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Activity</span>
                      </button>
                      <button
                        onClick={() => setDayModal({ open: true, editData: day })}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Day"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDay(day.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Timeline */}
                <div className="p-6">
                  {activities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No activities scheduled for this day yet.
                    </p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-5">
                      {activities.map((act) => (
                        <div key={act.id} className="relative">
                          <span className="absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full bg-slate-950 border-[3px] border-indigo-500" />

                          <div className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4 transition">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-0.5 rounded-md">
                                  <Clock className="w-3 h-3" />
                                  {act.startTime} – {act.endTime}
                                </span>
                                <h4 className="font-bold text-white text-sm">{act.title}</h4>
                              </div>

                              {act.description && (
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  {act.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                                {act.location && (
                                  <span className="inline-flex items-center gap-1 font-medium text-slate-300">
                                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                    {act.location}
                                  </span>
                                )}
                                {act.estimatedCost > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-emerald-300 font-semibold bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                                    <IndianRupee className="w-3 h-3" />
                                    {Number(act.estimatedCost).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {permissions.canEdit && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() =>
                                    setActivityModal({
                                      open: true,
                                      itineraryId: day.id,
                                      editData: act,
                                      defaultOrder: act.displayOrder,
                                    })
                                  }
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(day.id, act.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateItineraryModal
        isOpen={dayModal.open}
        onClose={() => setDayModal({ open: false, editData: null })}
        tripId={trip.id}
        trip={trip}
        editData={dayModal.editData}
        onSaved={loadItineraries}
      />

      <ActivityModal
        isOpen={activityModal.open}
        onClose={() => setActivityModal({ ...activityModal, open: false })}
        tripId={trip.id}
        itineraryId={activityModal.itineraryId}
        editData={activityModal.editData}
        defaultOrder={activityModal.defaultOrder}
        onSaved={loadItineraries}
      />
    </div>
  );
}