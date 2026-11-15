import { useState } from 'react';
import {
  X,
  Sparkles,
  SunSnow,
  Wallet,
  MapPin,
  Utensils,
  Compass,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { workspaceApi } from '../../api/workspaceApi';

export default function AiDiscoverModal({ isOpen, onClose }) {
  const [destination, setDestination] = useState('');
  const [seasonOrMonth, setSeasonOrMonth] = useState('Winter (November - February)');
  const [groupSize, setGroupSize] = useState(2);
  const [totalBudget, setTotalBudget] = useState('15000');
  const [customQuestion, setCustomQuestion] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDiscover = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await workspaceApi.discoverAiDestination({
        destination: destination.trim() || 'Best Indian Destination',
        seasonOrMonth,
        groupSize: Number(groupSize) || 2,
        totalBudget: totalBudget ? Number(totalBudget) : null,
        customQuestion: customQuestion.trim() || null,
      });
      setGuide(data);
    } catch (err) {
      setError(err?.message || 'AI Advisor se response nahi aa paya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">AI Trip & Budget Finder</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NEW • 1-Click AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Season, group size aur budget daalo — AI best spots, food & plan batayega
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleDiscover} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Destination (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Manali, Goa, Jaipur"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Season / Weather
              </label>
              <select
                value={seasonOrMonth}
                onChange={(e) => setSeasonOrMonth(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              >
                <option value="Winter (November - February)">Winter (Thand / Snow)</option>
                <option value="Summer (March - June)">Summer (Garmi / Hill Stations)</option>
                <option value="Monsoon (July - September)">Monsoon (Baarish / Greenery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kitne Log Hain? (People)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Total Budget (₹)
              </label>
              <input
                type="number"
                min="1000"
                placeholder="e.g., 15000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <input
                type="text"
                placeholder="Extra preference (e.g., snowfall, street food, budget hostels, 4 days trip)..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:opacity-95 text-white rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-60 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>1-Click Generate</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* AI Results */}
          {guide && (
            <div className="space-y-5 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <SunSnow className="w-4 h-4" />
                    <span>Season & Weather Fit</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{guide.seasonVerdict}</p>
                  {guide.weatherAndPackingTip && (
                    <p className="text-[11px] text-amber-200 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                      <strong>Packing Tip:</strong> {guide.weatherAndPackingTip}
                    </p>
                  )}
                </div>

                <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Wallet className="w-4 h-4" />
                    <span>Group Budget & Coverage</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{guide.budgetBreakdown}</p>
                </div>
              </div>

              {guide.topPlaces?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Best Places You Can Cover</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {guide.topPlaces.map((spot, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-xs">{spot.name}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 shrink-0">
                            {spot.estimatedCost}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{spot.whyGo}</p>
                        <p className="text-[10px] text-slate-500">Best Time: {spot.bestTimeToVisit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.mustTryFood?.length > 0 && (
                  <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <Utensils className="w-4 h-4" />
                      <span>Must-Try Local Food</span>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {guide.mustTryFood.map((food, idx) => (
                        <div key={idx} className="py-2 flex justify-between items-center gap-2">
                          <div>
                            <p className="text-xs font-semibold text-white">{food.dishName}</p>
                            <p className="text-[11px] text-slate-400">{food.whereToTry}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">{food.approxPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guide.alternativeDestinations?.length > 0 && (
                  <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                      <Compass className="w-4 h-4" />
                      <span>Best Destinations in This Season & Budget</span>
                    </div>
                    <ul className="space-y-1.5">
                      {guide.alternativeDestinations.map((alt, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
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
      </div>
    </div>
  );
}