import api from './api';

export const aiService = {
  analyzeText: async (data) => {
    return await api.post('/ai/analyze', data);
  },

  checkDuplicate: async (data) => {
    return await api.post('/ai/duplicate-check', data);
  },

  processLanguage: async (text) => {
    return await api.post('/ai/language', { text });
  },

  getRecommendations: async (params) => {
    return await api.get('/ai/recommendations', { params });
  },

  getSummary: async (params) => {
    return await api.get('/ai/summary', { params });
  },

  getClusters: async (params) => {
    return await api.get('/ai/clusters', { params });
  },
};
