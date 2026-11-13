import axiosClient from './axiosClient';

export const tripApi = {
  // Trips CRUD
  getMyTrips: () => axiosClient.get('/api/trips'),
  getTripById: (tripId) => axiosClient.get(`/api/trips/${tripId}`),
  createTrip: (data) => axiosClient.post('/api/trips', data), // { title, description, destination, startDate, endDate }
  updateTrip: (tripId, data) => axiosClient.patch(`/api/trips/${tripId}`, data),
  deleteTrip: (tripId) => axiosClient.delete(`/api/trips/${tripId}`),

  // Members & Roles
  getMembers: (tripId) => axiosClient.get(`/api/trips/${tripId}/members`),
  updateMemberRole: (tripId, userId, role) =>
    axiosClient.patch(`/api/trips/${tripId}/members/${userId}/role`, { role }), // OWNER | EDITOR | VIEWER
  removeMember: (tripId, userId) =>
    axiosClient.delete(`/api/trips/${tripId}/members/${userId}`),

  // Invitations
  inviteMember: (tripId, data) =>
    axiosClient.post(`/api/trips/${tripId}/invitations`, data), // { email, role }
  acceptInvitation: (tripId, token) =>
    axiosClient.post(`/api/trips/${tripId}/invitations/accept`, null, { params: { token } }),
  rejectInvitation: (tripId, token) =>
    axiosClient.post(`/api/trips/${tripId}/invitations/reject`, null, { params: { token } }),
};