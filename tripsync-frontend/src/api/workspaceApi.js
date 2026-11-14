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
};