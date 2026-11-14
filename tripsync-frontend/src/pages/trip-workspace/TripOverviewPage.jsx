import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Trash2,
  Edit3,
  Users,
  Crown,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { tripApi } from '../../api/tripApi';
import EditTripModal from '../../features/trips/EditTripModal';
import InviteMemberModal from '../../features/trips/InviteMemberModal';

const AVATAR_GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
];

export default function TripOverviewPage() {
  const { trip, members, myTripRole, permissions, refreshTripData } = useTrip();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const durationDays = Math.max(
    1,
    Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1
  );

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this trip?')) return;
    try {
      await tripApi.deleteTrip(trip.id);
      navigate('/dashboard');
    } catch (err) {
      alert(err?.message || 'Failed to delete trip.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await tripApi.updateMemberRole(trip.id, userId, newRole);
      refreshTripData();
    } catch (err) {
      alert(err?.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from this trip?`)) return;
    try {
      await tripApi.removeMember(trip.id, userId);
      refreshTripData();
    } catch (err) {
      alert(err?.message || 'Failed to remove member.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dark Glass KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Trip Duration
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Travel Group
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5">
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/25 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Access Level
            </p>
            <p className="text-2xl font-extrabold text-white mt-0.5">{myTripRole}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trip Overview Card */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Trip Brief & Notes</h2>
                </div>

                {permissions.canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 hover:bg-indigo-500/25 rounded-lg transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                    {permissions.isOwner && (
                      <button
                        onClick={handleDeleteTrip}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/25 hover:bg-rose-500/25 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed mt-4">
                {trip.description ||
                  'No summary added yet. Click "Edit Details" to add meeting points, packing notes, or trip goals.'}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-rose-400" />
              Destination: <strong className="text-white">{trip.destination}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Crown className="w-4 h-4 text-amber-400" />
              Organized by <strong className="text-white">{trip.ownerName}</strong>
            </span>
          </div>
        </div>

        {/* Right: Members Directory */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Members ({members.length})</h2>
                <p className="text-xs text-slate-400">Manage collaborators & permissions</p>
              </div>

              {permissions.isOwner && (
                <button
                  onClick={() => setInviteOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3.5 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-800/80 mt-2">
              {members.map((m, idx) => {
                const initials = m.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const avatarGrad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

                return (
                  <div key={m.userId} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                      >
                        {initials || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {m.fullName}
                          {m.email === user?.email && (
                            <span className="ml-1.5 text-[11px] font-medium text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {permissions.isOwner && m.email !== user?.email ? (
                        <>
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                            className="text-xs border border-slate-700 rounded-lg px-2 py-1 bg-slate-950 font-semibold text-slate-200 outline-none focus:border-indigo-500"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(m.userId, m.fullName)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EditTripModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        trip={trip}
        onUpdated={refreshTripData}
      />

      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        tripId={trip.id}
      />
    </div>
  );
}