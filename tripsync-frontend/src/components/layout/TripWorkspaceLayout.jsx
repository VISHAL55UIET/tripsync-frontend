import { useState } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Wallet,
  FileText,
  LayoutDashboard,
  Sparkles,
  Camera,
} from 'lucide-react';
import { TripProvider, useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useTripLiveSync } from '../../hooks/useTripLiveSync';

function WorkspaceInner() {
  const { trip, myTripRole, loading } = useTrip();
  const { user } = useAuth();
  const { tripId } = useParams();
  const [liveToast, setLiveToast] = useState(null);

  useTripLiveSync(tripId, (event) => {
    window.dispatchEvent(new CustomEvent('tripsync:live-update', { detail: event }));

    if (!event.actorEmail || event.actorEmail !== user?.email) {
      setLiveToast(event);
      setTimeout(() => {
        setLiveToast((curr) => (curr?.timestamp === event.timestamp ? null : curr));
      }, 4500);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
        <p className="text-slate-400 mb-4">Trip not found or you don't have access.</p>
        <Link to="/dashboard" className="text-indigo-400 font-semibold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const navItems = [
    { to: `/trips/${tripId}`, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: `/trips/${tripId}/itinerary`, label: 'Itinerary', icon: Calendar },
    { to: `/trips/${tripId}/finance`, label: 'Expenses & Balances', icon: Wallet },
    { to: `/trips/${tripId}/documents`, label: 'Documents', icon: FileText },
    { to: `/trips/${tripId}/memories`, label: 'Memories', icon: Camera },
    { to: `/trips/${tripId}/ai-guide`, label: 'AI Trip Guide', icon: Sparkles },
  ];

  const roleStyles = {
    OWNER: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    EDITOR: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    VIEWER: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Trips</span>
        </Link>
      </div>

      {/* Dark Hero Workspace Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Trip Workspace</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {trip.title}
            </h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                roleStyles[myTripRole] || roleStyles.VIEWER
              }`}
            >
              {myTripRole}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-3">
            <span className="inline-flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-medium text-white">{trip.destination}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {trip.startDate} → {trip.endDate}
              </span>
            </span>
          </div>

          {/* Sub-Navigation Tabs */}
          <nav className="flex gap-2 border-t border-slate-800/90 mt-6 pt-5 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <Outlet />

      {/* Floating Real-Time Toast Banner */}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900/95 border border-indigo-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-ping" />
          <div className="text-xs">
            <p className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
              Live Trip Update • {liveToast.module}
            </p>
            <p className="text-slate-100 mt-0.5 font-medium">{liveToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripWorkspaceLayout() {
  const { tripId } = useParams();
  return (
    <TripProvider tripId={tripId}>
      <WorkspaceInner />
    </TripProvider>
  );
}