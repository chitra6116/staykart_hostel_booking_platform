import apiClient, { setAuthToken } from './client';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.data?.accessToken) {
      setAuthToken(response.data.accessToken);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    if (response.data?.accessToken) {
      setAuthToken(response.data.accessToken);
    }
    return response.data;
  },

  refresh: async () => {
    const response = await apiClient.post('/api/auth/refresh');
    if (response.data?.accessToken) {
      setAuthToken(response.data.accessToken);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      setAuthToken(null);
    }
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/api/users/profile', data);
    return response.data;
  }
};
