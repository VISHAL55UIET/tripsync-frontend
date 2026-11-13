import { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Clock, MapPin, Edit2, Trash2, IndianRupee } from 'lucide-react';
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
    return <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Day-by-Day Itinerary</h2>
          <p className="text-xs text-slate-500">Organize activities by date and time</p>
        </div>

        {permissions.canEdit && (
          <button
            onClick={() => setDayModal({ open: true, editData: null })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Day</span>
          </button>
        )}
      </div>

      {itineraries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <Calendar className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No itinerary days added yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Start building your schedule by adding dates between {trip.startDate} and {trip.endDate}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {itineraries.map((day, idx) => {
            const activities = [...(day.activities || [])].sort(
              (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.startTime.localeCompare(b.startTime)
            );

            return (
              <div key={day.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Day Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        Day {idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900">{day.date}</h3>
                    </div>
                    {day.notes && <p className="text-xs text-slate-600 mt-1">{day.notes}</p>}
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
                        className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Activity</span>
                      </button>
                      <button
                        onClick={() => setDayModal({ open: true, editData: day })}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg"
                        title="Edit Day"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDay(day.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                        title="Delete Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Activities List */}
                <div className="divide-y divide-slate-100">
                  {activities.length === 0 ? (
                    <p className="p-6 text-sm text-slate-400 text-center">
                      No activities planned for this day.
                    </p>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                              <Clock className="w-3 h-3" />
                              {act.startTime} - {act.endTime}
                            </span>
                            <h4 className="font-semibold text-slate-900 text-sm">{act.title}</h4>
                          </div>

                          {act.description && (
                            <p className="text-xs text-slate-600">{act.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            {act.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {act.location}
                              </span>
                            )}
                            {act.estimatedCost > 0 && (
                              <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                                <IndianRupee className="w-3 h-3" />
                                {act.estimatedCost}
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
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(day.id, act.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
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