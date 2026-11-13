import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { tripApi } from '../api/tripApi';
import { useAuth } from './AuthContext';

const TripContext = createContext(null);

export function TripProvider({ tripId, children }) {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshTripData = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const [tripData, membersData] = await Promise.all([
        tripApi.getTripById(tripId),
        tripApi.getMembers(tripId),
      ]);
      setTrip(tripData);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      console.error('Failed to load trip context:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refreshTripData();
  }, [refreshTripData]);

  const currentMember = useMemo(
    () => members.find((m) => m.email === user?.email || m.userId === user?.id),
    [members, user]
  );

  const myTripRole =
    currentMember?.role || (trip?.ownerId === user?.id ? 'OWNER' : 'VIEWER');

  const permissions = useMemo(
    () => ({
      isOwner: myTripRole === 'OWNER',
      canEdit: myTripRole === 'OWNER' || myTripRole === 'EDITOR',
      isViewer: myTripRole === 'VIEWER',
    }),
    [myTripRole]
  );

  const value = useMemo(
    () => ({
      trip,
      members,
      currentMember,
      myTripRole,
      permissions,
      loading,
      refreshTripData,
    }),
    [trip, members, currentMember, myTripRole, permissions, loading, refreshTripData]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}