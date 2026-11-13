import axiosClient from './axiosClient';

export const authApi = {
  // Public Auth Endpoints
  register: (data) => axiosClient.post('/auth/register', data), // { fullName, email, password }
  login: (data) => axiosClient.post('/auth/login', data),       // { email, password }
  
  // Authenticated User Endpoint
  changePassword: (data) => axiosClient.patch('/auth/change-password', data), // { currentPassword, newPassword }

  // Admin User Management Endpoints
  getAllUsers: () => axiosClient.get('/api/admin/users'),
  getUserById: (id) => axiosClient.get(`/api/admin/users/${id}`),
  updateUser: (id, data) => axiosClient.patch(`/api/admin/users/${id}`, data), // { fullName, email }
  updateUserStatus: (id, status) =>
    axiosClient.patch(`/api/admin/users/${id}/status`, { status }), // ACTIVE | DISABLED
  resetUserPassword: (id, newPassword) =>
    axiosClient.patch(`/api/admin/users/${id}/reset-password`, { newPassword }),
  deleteUser: (id) => axiosClient.delete(`/api/admin/users/${id}`),
};