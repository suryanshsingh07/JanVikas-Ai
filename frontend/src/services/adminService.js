import api from './api';

export const adminService = {
  getUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },

  getUser: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  toggleUserStatus: async (id) => {
    return await api.patch(`/admin/users/${id}/status`);
  },

  updateUserRole: async (id, role) => {
    return await api.patch(`/admin/users/${id}`, { role });
  },

  getStats: async () => {
    return await api.get('/admin/stats');
  },
};