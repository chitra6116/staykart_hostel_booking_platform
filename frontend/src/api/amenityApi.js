import apiClient from './client';

export const amenityApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/amenities');
    return response.data;
  }
};
