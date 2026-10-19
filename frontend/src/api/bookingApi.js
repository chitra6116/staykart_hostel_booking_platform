import apiClient from './client';

export const bookingApi = {
  create: async (bookingData) => {
    const response = await apiClient.post('/api/bookings', bookingData);
    return response.data;
  },

  pay: async (bookingId, paymentData) => {
    const response = await apiClient.post(`/api/bookings/${bookingId}/pay`, paymentData);
    return response.data;
  },

  cancel: async (bookingId, reason) => {
    const response = await apiClient.post(`/api/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  getRefundPreview: async (bookingId) => {
    const response = await apiClient.get(`/api/bookings/${bookingId}/refund-preview`);
    return response.data;
  },

  getMyBookings: async (params = {}) => {
    const response = await apiClient.get('/api/bookings/my-bookings', { params });
    return response.data;
  },

  getByCode: async (code) => {
    const response = await apiClient.get(`/api/bookings/${code}`);
    return response.data;
  },

  downloadInvoice: async (code) => {
    const response = await apiClient.get(`/api/bookings/${code}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
