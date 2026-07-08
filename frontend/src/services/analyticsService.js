import api from './api';

export const analyticsService = {
  getOverview: async (params) => {
    const response = await api.get('/analytics/overview', { params });
    return response.data;
  },

  getCategories: async (params) => {
    const response = await api.get('/analytics/categories', { params });
    return response.data;
  },

  getHeatmap: async (params) => {
    const response = await api.get('/analytics/heatmap', { params });
    return response.data;
  },

  getTrends: async (params) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  },

  getTopDistricts: async (params) => {
    const response = await api.get('/analytics/districts', { params });
    return response.data;
  },
};
