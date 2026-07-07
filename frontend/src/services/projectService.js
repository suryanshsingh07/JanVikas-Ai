import api from './api';

export const projectService = {
  getAll: async (params) => {
    return await api.get('/projects', { params });
  },

  getRanked: async (params) => {
    return await api.get('/projects/ranked', { params });
  },

  getById: async (id) => {
    return await api.get(`/projects/${id}`);
  },

  create: async (data) => {
    return await api.post('/projects', data);
  },

  update: async (id, data) => {
    return await api.put(`/projects/${id}`, data);
  },

  updateStatus: async (id, status) => {
    return await api.put(`/projects/${id}/status`, { status });
  },

  delete: async (id) => {
    return await api.delete(`/projects/${id}`);
  },
};
