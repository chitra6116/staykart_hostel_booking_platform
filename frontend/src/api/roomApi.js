import apiClient from './client';

export const roomApi = {
  search: async (params = {}) => {
    const response = await apiClient.get('/api/rooms/search', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/rooms/${id}`);
    return response.data;
  },

  getDisabledDates: async (id) => {
    const response = await apiClient.get(`/api/rooms/${id}/disabled-dates`);
    return response.data;
  }
};
