import apiClient from './client';

export const adminApi = {
  // Dashboard
  getDashboard: async () => {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  },

  // Calendar
  getCalendar: async (params = {}) => {
    const response = await apiClient.get('/api/admin/calendar', { params });
    return response.data;
  },

  // Properties
  createProperty: async (data) => {
    const response = await apiClient.post('/api/admin/properties', data);
    return response.data;
  },

  updateProperty: async (id, data) => {
    const response = await apiClient.put(`/api/admin/properties/${id}`, data);
    return response.data;
  },

  togglePropertyStatus: async (id) => {
    const response = await apiClient.patch(`/api/admin/properties/${id}/toggle-status`);
    return response.data;
  },

  // Rooms
  createRoom: async (data) => {
    const response = await apiClient.post('/api/admin/rooms', data);
    return response.data;
  },

  toggleRoomStatus: async (id) => {
    const response = await apiClient.patch(`/api/admin/rooms/${id}/toggle-status`);
    return response.data;
  },

  scheduleMaintenance: async (data) => {
    const response = await apiClient.post('/api/admin/rooms/maintenance', data);
    return response.data;
  },

  releaseMaintenance: async (id) => {
    const response = await apiClient.delete(`/api/admin/rooms/maintenance/${id}`);
    return response.data;
  },

  bulkBlockRooms: async (data) => {
    const response = await apiClient.post('/api/admin/rooms/bulk-block', data);
    return response.data;
  },

  // Photos & Images
  uploadPropertyImages: async (propertyId, formData) => {
    const response = await apiClient.post(`/api/admin/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadRoomImages: async (roomId, formData) => {
    const response = await apiClient.post(`/api/admin/rooms/${roomId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateImage: async (id, data) => {
    const response = await apiClient.put(`/api/admin/images/${id}`, data);
    return response.data;
  },

  reorderImages: async (imageIds) => {
    const response = await apiClient.put('/api/admin/images/reorder', { imageIds });
    return response.data;
  },

  deleteImage: async (id) => {
    const response = await apiClient.delete(`/api/admin/images/${id}`);
    return response.data;
  },

  // Amenities
  createAmenity: async (data) => {
    const response = await apiClient.post('/api/admin/amenities', data);
    return response.data;
  },

  updateAmenity: async (id, data) => {
    const response = await apiClient.put(`/api/admin/amenities/${id}`, data);
    return response.data;
  },

  deleteAmenity: async (id) => {
    const response = await apiClient.delete(`/api/admin/amenities/${id}`);
    return response.data;
  },

  // Pricing Rules
  getPricingRules: async () => {
    const response = await apiClient.get('/api/admin/pricing/rules');
    return response.data;
  },

  createPricingRule: async (data) => {
    const response = await apiClient.post('/api/admin/pricing/rules', data);
    return response.data;
  },

  deletePricingRule: async (id) => {
    const response = await apiClient.delete(`/api/admin/pricing/rules/${id}`);
    return response.data;
  },

  bulkPricing: async (data) => {
    const response = await apiClient.post('/api/admin/pricing/bulk', data);
    return response.data;
  },

  // Bookings
  getAllBookings: async (params = {}) => {
    const response = await apiClient.get('/api/admin/bookings', { params });
    return response.data;
  },

  checkInGuest: async (id) => {
    const response = await apiClient.post(`/api/admin/bookings/${id}/check-in`);
    return response.data;
  },

  checkOutGuest: async (id) => {
    const response = await apiClient.post(`/api/admin/bookings/${id}/check-out`);
    return response.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await apiClient.post(`/api/admin/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Users
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await apiClient.patch(`/api/admin/users/${id}/toggle-status`);
    return response.data;
  }
};
