import api from './api';

export const authService = {
  updateProfile: async (data) => {
    return await api.put('/auth/profile', data);
  },

  changePassword: async (data) => {
    return await api.put('/auth/change-password', data);
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getUserStats: async (userId = 'me') => {
    return await api.get(`/users/stats/${userId}`);
  },

  // Admin routes
  getUsers: async (params) => {
    return await api.get('/users', { params });
  },

  updateUserRole: async (userId, role) => {
    return await api.put(`/users/${userId}/role`, { role });
  },

  toggleUserStatus: async (userId) => {
    return await api.put(`/users/${userId}/status`);
  },
};
