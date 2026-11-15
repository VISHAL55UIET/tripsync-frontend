import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  SunSnow,
  Wallet,
  MapPin,
  Utensils,
  Compass,
  AlertCircle,
  Loader2,
  CalendarPlus,
  Check,
} from 'lucide-react';
import { workspaceApi } from '../../api/workspaceApi';
import { itineraryApi } from '../../api/itineraryApi';
import { useTrip } from '../../context/TripContext';

function mapBestTimeToSlot(bestTime = '') {
  const lower = bestTime.toLowerCase();
  if (lower.includes('early') || lower.includes('sunrise')) {
    return { startTime: '06:30', endTime: '08:30' };
  }
  if (lower.includes('morning')) {
    return { startTime: '09:30', endTime: '11:30' };
  }
  if (lower.includes('afternoon')) {
    return { startTime: '14:00', endTime: '16:30' };
  }
  if (lower.includes('sunset') || lower.includes('evening')) {
    return { startTime: '17:00', endTime: '19:00' };
  }
  if (lower.includes('night')) {
    return { startTime: '20:00', endTime: '22:00' };
  }
  return { startTime: '10:00', endTime: '12:00' };
}

function parseNumericCost(costStr = '') {
  const match = String(costStr).replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export default function AiTripGuideTab({ trip, membersCount = 1 }) {
  const { permissions } = useTrip();
  const [totalBudget, setTotalBudget] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Itinerary state for 1-Click Add
  const [itineraries, setItineraries] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState('');
  const [addingSpotIdx, setAddingSpotIdx] = useState(null);
  const [addedSpots, setAddedSpots] = useState({});

  const loadItineraries = useCallback(async () => {
    if (!trip?.id) return;
    try {
      const data = await itineraryApi.getItineraries(trip.id);
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      setItineraries(sorted);
      if (sorted.length > 0 && !selectedDayId) {
        setSelectedDayId(String(sorted[0].id));
      }
    } catch (err) {
      console.error('Failed to load itinerary days:', err);
    }
  }, [trip?.id, selectedDayId]);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  const handleGenerateGuide = async (e) => {
    e.preventDefault();
    setError('');
    setAddedSpots({});
    setLoading(true);

    try {
      const payload = {
        destination: trip?.destination || null,
        seasonOrMonth: null,
        groupSize: membersCount || 1,
        totalBudget: totalBudget ? Number(totalBudget) : null,
        customQuestion: customQuestion.trim() || null,
      };

      const data = await workspaceApi.getTripAiGuide(trip.id, payload);
      setGuide(data);
    } catch (err) {
      setError(err?.message || 'AI Travel Advisor se response nahi aa paya. API key check karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpotToItinerary = async (spot, idx) => {
    if (!trip?.id || addingSpotIdx !== null) return;
    setError('');
    setAddingSpotIdx(idx);

    try {
      let targetItinerary = itineraries.find((d) => String(d.id) === String(selectedDayId));

      // Agar abhi tak koi itinerary day create nahi hua hai, toh Day 1 auto-create karo
      if (!targetItinerary) {
        targetItinerary = await itineraryApi.createItinerary(trip.id, {
          date: trip.startDate,
          notes: 'AI Suggested Day 1 Plan',
        });
        await loadItineraries();
        setSelectedDayId(String(targetItinerary.id));
      }

      const existingCount = targetItinerary.activities?.length || 0;
      const { startTime, endTime } = mapBestTimeToSlot(spot.bestTimeToVisit);

      await itineraryApi.addActivity(trip.id, targetItinerary.id, {
        title: spot.name,
        description: spot.whyGo || `Recommended time: ${spot.bestTimeToVisit || 'Flexible'}`,
        location: `${spot.name}, ${trip.destination}`,
        startTime,
        endTime,
        estimatedCost: parseNumericCost(spot.estimatedCost),
        displayOrder: existingCount + 1,
      });

      const dayIndex = itineraries.findIndex((d) => String(d.id) === String(targetItinerary.id));
      const dayLabel = dayIndex >= 0 ? `Day ${dayIndex + 1}` : 'Day 1';

      setAddedSpots((prev) => ({ ...prev, [idx]: dayLabel }));
      await loadItineraries();
    } catch (err) {
      setError(err?.message || 'Spot ko itinerary mein add karne mein error aaya.');
    } finally {
      setAddingSpotIdx(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt & Controls Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Travel & Budget Advisor</h2>
            <p className="text-xs text-slate-400">
              Season suitability, budget breakdown, best spots & famous food for{' '}
              <span className="text-indigo-400 font-semibold">{trip?.destination}</span> ({membersCount}{' '}
              {membersCount === 1 ? 'person' : 'people'})
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerateGuide} className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Total Group Budget (₹) (Optional)
            </label>
            <input
              type="number"
              min="500"
              placeholder="e.g., 16000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Specific Preference / Question (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Snowfall spots, veg cafes, peaceful places"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Trip...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Smart Guide</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Results Grid */}
      {guide && (
        <div className="space-y-6">
          {/* Row 1: Season Verdict & Budget Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <SunSnow className="w-4 h-4" />
                <span>Season & Weather Fit</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{guide.seasonVerdict}</p>
              {guide.weatherAndPackingTip && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong>Packing Tip:</strong> {guide.weatherAndPackingTip}
                </div>
              )}
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Wallet className="w-4 h-4" />
                <span>Group Budget & Coverage Breakdown</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{guide.budgetBreakdown}</p>
            </div>
          </div>

          {/* Row 2: Top Places to Visit + 1-Click Add to Itinerary */}
          {guide.topPlaces?.length > 0 && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                  <MapPin className="w-4 h-4" />
                  <span>Best Places You Can Cover</span>
                </div>

                {permissions?.canEdit && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Target Day:</span>
                    <select
                      value={selectedDayId}
                      onChange={(e) => setSelectedDayId(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:border-indigo-500 outline-none"
                    >
                      {itineraries.length === 0 ? (
                        <option value="">Day 1 ({trip?.startDate}) — Auto Create</option>
                      ) : (
                        itineraries.map((day, dIdx) => (
                          <option key={day.id} value={day.id}>
                            Day {dIdx + 1} ({day.date})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guide.topPlaces.map((spot, idx) => {
                  const isAdded = Boolean(addedSpots[idx]);
                  const isAdding = addingSpotIdx === idx;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-sm">{spot.name}</h4>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 shrink-0">
                            {spot.estimatedCost}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{spot.whyGo}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Best Time: <span className="text-slate-300">{spot.bestTimeToVisit}</span>
                        </p>
                      </div>

                      {permissions?.canEdit && (
                        <button
                          type="button"
                          disabled={isAdded || isAdding}
                          onClick={() => handleAddSpotToItinerary(spot, idx)}
                          className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                            isAdded
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
                              : 'bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-200 hover:text-white'
                          }`}
                        >
                          {isAdding ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Adding...</span>
                            </>
                          ) : isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added to {addedSpots[idx]}</span>
                            </>
                          ) : (
                            <>
                              <CalendarPlus className="w-3.5 h-3.5" />
                              <span>+ Add to Itinerary</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 3: Must-Try Food & Season Alternatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guide.mustTryFood?.length > 0 && (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Utensils className="w-4 h-4" />
                  <span>Must-Try Local Food</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {guide.mustTryFood.map((food, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{food.dishName}</p>
                        <p className="text-xs text-slate-400">{food.whereToTry}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 shrink-0">
                        {food.approxPrice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guide.alternativeDestinations?.length > 0 && (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-3">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Other Best Destinations in This Season & Budget</span>
                </div>
                <ul className="space-y-2">
                  {guide.alternativeDestinations.map((alt, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                    >
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}