import axiosClient from './axiosClient';

export const userApi = {
  // Current logged-in user profile
  getMe: () => axiosClient.get('/api/users/me'),
  updateProfile: (data) => axiosClient.put('/api/users/me', data),
  changePassword: (data) => axiosClient.put('/api/users/me/password', data),

  // Admin user management endpoints
  getAllUsers: () => axiosClient.get('/api/admin/users'),
  updateUserStatus: (userId, status) =>
    axiosClient.patch(`/api/admin/users/${userId}/status`, { status }),
};