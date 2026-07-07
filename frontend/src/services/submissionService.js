import api from './api';

export const submissionService = {
  create: async (formData) => {
    // Determine if we need multipart/form-data
    const isFormData = formData instanceof FormData;
    
    return await api.post('/submissions', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      // Increase timeout for large file uploads
      timeout: 30000,
    });
  },

  getAll: async (params) => {
    return await api.get('/submissions', { params });
  },

  getById: async (id) => {
    return await api.get(`/submissions/${id}`);
  },

  updateStatus: async (id, status, note = '') => {
    return await api.put(`/submissions/${id}/status`, { status, note });
  },

  vote: async (id) => {
    return await api.post(`/submissions/${id}/vote`);
  },

  delete: async (id) => {
    return await api.delete(`/submissions/${id}`);
  },

  getMapData: async (params) => {
    return await api.get('/submissions/map', { params });
  },
};
