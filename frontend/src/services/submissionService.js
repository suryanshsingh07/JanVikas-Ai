import api from './api';

export const submissionService = {
  create: async (formData) => {
    return await api.post('/submissions', formData, {
      timeout: 30000,
    });
  },

  getAll: async (params) => {
    // Filter out empty parameters to avoid 422 errors
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
    return await api.get('/submissions', { params: cleanParams });
  },

  getById: async (id) => {
    return await api.get(`/submissions/${id}`);
  },

  updateStatus: async (id, status, note = '') => {
    // If status is 'resolved' and note is a FormData (contains files), send multipart
    if (status === 'resolved' && note instanceof FormData) {
      // note will be a FormData with files appended and optionally a text note
      note.append('status', status);
      return await api.put(`/submissions/${id}/status`, note, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
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
