import apiClient from './client';

export const propertyApi = {
  search: async (params = {}) => {
    const response = await apiClient.get('/api/properties', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/api/properties/${id}`);
    return response.data;
  },

  getRooms: async (propertyId, params = {}) => {
    const response = await apiClient.get(`/api/properties/${propertyId}/rooms`, { params });
    return response.data;
  }
};
