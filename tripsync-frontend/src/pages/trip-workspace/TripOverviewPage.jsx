import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Edit3, Users, Crown } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { tripApi } from '../../api/tripApi';
import EditTripModal from '../../features/trips/EditTripModal';
import InviteMemberModal from '../../features/trips/InviteMemberModal';

export default function TripOverviewPage() {
  const { trip, members, permissions, refreshTripData } = useTrip();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip permanently?')) return;
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
      alert(err?.message || 'Failed to update role.');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Description & Trip Controls */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2 className="text-lg font-bold text-slate-900">About This Trip</h2>
            {permissions.canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {permissions.isOwner && (
                  <button
                    onClick={handleDeleteTrip}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
            {trip.description || 'No description added for this trip yet.'}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>
              Created by <strong className="text-slate-700">{trip.ownerName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Members & Roles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Members ({members.length})</h2>
          </div>

          {permissions.isOwner && (
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((m) => (
            <div key={m.userId} className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{m.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {permissions.isOwner && m.email !== user?.email ? (
                  <>
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-medium"
                    >
                      <option value="OWNER">OWNER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(m.userId, m.fullName)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {m.role}
                  </span>
                )}
              </div>
            </div>
          ))}
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