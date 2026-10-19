import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const hasLoggedIn = localStorage.getItem('has_logged_in') === 'true';
    if (!hasLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      const authData = await authApi.refresh();
      const u = authData.user || authData;
      setUser({
        id: u.id || u.userId,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone || u.phoneNumber,
        role: u.role
      });
    } catch {
      localStorage.removeItem('has_logged_in');
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [initAuth]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    const u = data.user || data;
    const authUser = {
      id: u.id || u.userId,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone || u.phoneNumber,
      role: u.role
    };
    setUser(authUser);
    return authUser;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    const u = data.user || data;
    const authUser = {
      id: u.id || u.userId,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone || u.phoneNumber,
      role: u.role
    };
    setUser(authUser);
    return authUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('has_logged_in');
      setAuthToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const updated = await authApi.updateProfile(profileData);
    setUser((prev) => (prev ? {
      ...prev,
      fullName: updated.fullName,
      email: updated.email || prev.email,
      phone: updated.phone || profileData.phone || profileData.phoneNumber || prev.phone
    } : null));
    return updated;
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
