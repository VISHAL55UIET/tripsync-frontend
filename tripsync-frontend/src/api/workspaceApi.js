import axiosClient from './axiosClient';

export const workspaceApi = {
  // Documents
  getDocuments: (tripId) => axiosClient.get(`/api/trips/${tripId}/documents`),

  uploadDocument: (tripId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/api/trips/${tripId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  downloadDocument: async (tripId, documentId, fileName) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/trips/${tripId}/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to download document');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteDocument: (tripId, documentId) =>
    axiosClient.delete(`/api/trips/${tripId}/documents/${documentId}`),

  // Notifications
  getNotifications: () => axiosClient.get('/api/notifications'),
  markNotificationRead: (notificationId) =>
    axiosClient.patch(`/api/notifications/${notificationId}/read`),

  // AI Travel Advisor
  getTripAiGuide: (tripId, data = {}) =>
    axiosClient.post(`/api/trips/${tripId}/ai/guide`, data),
  discoverAiDestination: (data) =>
    axiosClient.post('/api/ai/discover', data),

  // Smart Debt Simplification
  getSimplifiedDebts: (tripId) =>
    axiosClient.get(`/api/trips/${tripId}/debts/simplify`),
  // Group Polls & Voting
  getTripPolls: (tripId) => axiosClient.get(`/api/trips/${tripId}/polls`),
  createTripPoll: (tripId, data) => axiosClient.post(`/api/trips/${tripId}/polls`, data),
  voteTripPoll: (tripId, pollId, optionId) =>
    axiosClient.post(`/api/trips/${tripId}/polls/${pollId}/vote/${optionId}`),
  toggleCloseTripPoll: (tripId, pollId) =>
    axiosClient.patch(`/api/trips/${tripId}/polls/${pollId}/toggle-close`),
  deleteTripPoll: (tripId, pollId) =>
    axiosClient.delete(`/api/trips/${tripId}/polls/${pollId}`),
  // Trip Memories & Photo Wall
  getTripMemories: (tripId) => axiosClient.get(`/api/trips/${tripId}/memories`),
  uploadTripMemory: (tripId, formData) =>
    axiosClient.post(`/api/trips/${tripId}/memories`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  toggleMemoryLike: (tripId, memoryId) =>
    axiosClient.post(`/api/trips/${tripId}/memories/${memoryId}/like`),
  deleteTripMemory: (tripId, memoryId) =>
    axiosClient.delete(`/api/trips/${tripId}/memories/${memoryId}`),
};