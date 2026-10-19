import apiClient from './client';

export const pricingApi = {
  getQuote: async (params) => {
    const response = await apiClient.post('/api/pricing/quote', {
      roomId: params.roomId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guestsCount: params.guestsCount || 1
    });
    return response.data;
  },

  getQuoteByParams: async (roomId, checkIn, checkOut, guests = 1) => {
    const response = await apiClient.get(`/api/pricing/rooms/${roomId}/quote`, {
      params: { checkIn, checkOut, guests }
    });
    return response.data;
  }
};
