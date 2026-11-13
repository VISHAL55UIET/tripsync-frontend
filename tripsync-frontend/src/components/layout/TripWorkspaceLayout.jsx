import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Wallet, FileText, LayoutDashboard } from 'lucide-react';
import { TripProvider, useTrip } from '../../context/TripContext';

function WorkspaceInner() {
  const { trip, myTripRole, loading } = useTrip();
  const { tripId } = useParams();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Trip not found or you don't have access.</p>
        <Link to="/dashboard" className="text-indigo-600 font-medium hover:underline">
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
  ];

  const roleColors = {
    OWNER: 'bg-indigo-100 text-indigo-700',
    EDITOR: 'bg-emerald-100 text-emerald-700',
    VIEWER: 'bg-slate-200 text-slate-700',
  };

  return (
    <div>
      {/* Trip Header */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Trips</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{trip.title}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[myTripRole]}`}>
                  {myTripRole}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {trip.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {trip.startDate} → {trip.endDate}
                </span>
              </div>
            </div>
          </div>

          {/* Workspace Sub-Navigation Tabs */}
          <nav className="flex gap-2 border-t border-slate-100 mt-6 pt-4 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
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

      {/* Active Tab Content */}
      <Outlet />
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