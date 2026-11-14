import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  MapPin,
  Calendar,
  ArrowRight,
  Compass,
  Search,
  Plane,
  Clock,
  CheckCircle2,
  Sparkles,
  Sun,
  Mountain,
  Landmark,
} from 'lucide-react';
import { tripApi } from '../../api/tripApi';
import { useAuth } from '../../context/AuthContext';
import CreateTripModal from '../../features/trips/CreateTripModal';

const CARD_THEMES = [
  {
    banner: 'from-indigo-600 via-violet-600 to-purple-700',
    accent: 'group-hover:text-indigo-400',
    ring: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
  },
  {
    banner: 'from-cyan-600 via-blue-600 to-indigo-700',
    accent: 'group-hover:text-sky-400',
    ring: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
  },
  {
    banner: 'from-emerald-600 via-teal-600 to-cyan-700',
    accent: 'group-hover:text-emerald-400',
    ring: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
  },
  {
    banner: 'from-orange-500 via-rose-600 to-pink-700',
    accent: 'group-hover:text-rose-400',
    ring: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
  },
];

const STARTER_TEMPLATES = [
  {
    title: 'Goa Beach & Nightlife Getaway',
    destination: 'North Goa, India',
    description: 'Beach shacks, water sports at Baga, Fort Aguada sunset, and group villa stay.',
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    icon: Sun,
    tag: 'Beach • 4 Days',
  },
  {
    title: 'Manali & Solang Valley Expedition',
    destination: 'Manali, Himachal Pradesh',
    description: 'Paragliding in Solang, Atal Tunnel drive, Old Manali cafes, and bonfire nights.',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    icon: Mountain,
    tag: 'Mountains • 5 Days',
  },
  {
    title: 'Jaipur Royal Heritage Weekend',
    destination: 'Jaipur, Rajasthan',
    description: 'Amber Fort sunrise, Hawa Mahal walk, Johari Bazaar shopping, and Rajasthani dinner.',
    gradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    icon: Landmark,
    tag: 'Culture • 3 Days',
  },
];

function getTripStatus(startDate, endDate) {
  const today = new Date().toISOString().split('T')[0];
  if (endDate < today) {
    return {
      label: 'Completed',
      badge: 'bg-slate-950/75 text-slate-200 border border-white/15',
    };
  }
  if (startDate <= today && endDate >= today) {
    return {
      label: 'Ongoing',
      badge: 'bg-emerald-500 text-slate-950 font-extrabold shadow-xs',
    };
  }
  return {
    label: 'Upcoming',
    badge: 'bg-slate-950/75 text-indigo-200 border border-indigo-400/30',
  };
}

function getDurationDays(startDate, endDate) {
  const diff = new Date(endDate) - new Date(startDate);
  const days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  return `${days} ${days === 1 ? 'Day' : 'Days'}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillTemplate, setPrefillTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripApi.getMyTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const stats = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    trips.forEach((t) => {
      const s = getTripStatus(t.startDate, t.endDate).label;
      if (s === 'Upcoming') upcoming++;
      else if (s === 'Ongoing') ongoing++;
      else completed++;
    });
    return { total: trips.length, upcoming, ongoing, completed };
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchesSearch =
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === 'ALL') return true;
      return getTripStatus(t.startDate, t.endDate).label.toUpperCase() === statusFilter;
    });
  }, [trips, searchQuery, statusFilter]);

  const openBlankModal = () => {
    setPrefillTemplate(null);
    setIsModalOpen(true);
  };

  const openTemplateModal = (tpl) => {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 3);

    setPrefillTemplate({
      title: tpl.title,
      destination: tpl.destination,
      description: tpl.description,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const firstName = user?.fullName?.split(' ')[0] || 'Traveler';

  return (
    <div className="space-y-8">
      {/* Dark Hero Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-7 sm:p-10 text-white shadow-2xl">
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-xs font-semibold text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Welcome back, {firstName}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Your Trip{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
                Command Center
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
              Plan collaborative itineraries, invite your crew, vault tickets, and split every rupee
              with instant settlement tracking.
            </p>
          </div>

          <button
            onClick={openBlankModal}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Trip</span>
          </button>
        </div>
      </div>

      {/* Dark Glass KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Trips
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/25 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Upcoming
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{stats.upcoming}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ongoing</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{stats.ongoing}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/25 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completed
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              {stats.completed}
            </p>
          </div>
        </div>
      </div>

      {/* Dark Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by trip title or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                statusFilter === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Trips' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid OR Starter Templates */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-8 sm:p-10 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {trips.length === 0 ? 'Ready for your first adventure?' : 'No matching trips found'}
            </h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto mt-1.5 mb-6">
              {trips.length === 0
                ? 'Start from scratch or pick one of our quick-start destination templates below to launch your workspace in one click.'
                : 'Try clearing your search filter to see all your trip workspaces.'}
            </p>
            {trips.length === 0 && (
              <button
                onClick={openBlankModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Trip</span>
              </button>
            )}
          </div>

          {trips.length === 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                Quick-Start Templates (1-Click Setup)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {STARTER_TEMPLATES.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => openTemplateModal(tpl)}
                      className="group text-left bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <div
                        className={`h-24 bg-gradient-to-r ${tpl.gradient} p-4 flex items-center justify-between text-white`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-xs flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold bg-black/30 px-2.5 py-1 rounded-full">
                          {tpl.tag}
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="font-bold text-white text-sm group-hover:text-indigo-400 transition flex items-center justify-between">
                          <span>{tpl.title}</span>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => {
            const status = getTripStatus(trip.startDate, trip.endDate);
            const theme = CARD_THEMES[index % CARD_THEMES.length];

            return (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className={`group bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-0.5 ${theme.ring} transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div
                    className={`h-28 bg-gradient-to-r ${theme.banner} p-4 flex items-start justify-between relative overflow-hidden`}
                  >
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/15 blur-xl" />
                    <span className="text-xs font-semibold bg-black/30 backdrop-blur-xs text-white px-3 py-1 rounded-full">
                      {getDurationDays(trip.startDate, trip.endDate)}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.badge}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2
                        className={`text-lg font-bold text-white ${theme.accent} transition line-clamp-1`}
                      >
                        {trip.title}
                      </h2>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition shrink-0 mt-1" />
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 min-h-[32px]">
                      {trip.description || 'Collaborative itinerary & group expense workspace.'}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300 truncate max-w-[52%]">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{trip.destination}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{trip.startDate}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CreateTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={prefillTemplate}
        onCreated={(newTrip) => setTrips((prev) => [newTrip, ...prev])}
      />
    </div>
  );
}