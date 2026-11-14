import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (data) => axiosClient.post('/auth/register', data),
  changePassword: (data) => axiosClient.patch('/auth/change-password', data),

  // Admin User Management (/api/admin/users)
  getAllUsers: () => axiosClient.get('/api/admin/users'),
  getUserById: (id) => axiosClient.get(`/api/admin/users/${id}`),
  updateUser: (id, data) => axiosClient.patch(`/api/admin/users/${id}`, data),
  updateUserStatus: (id, status) =>
    axiosClient.patch(`/api/admin/users/${id}/status`, { status }),
  resetUserPassword: (id, newPassword) =>
    axiosClient.patch(`/api/admin/users/${id}/reset-password`, { newPassword }),
  deleteUser: (id) => axiosClient.delete(`/api/admin/users/${id}`),
};