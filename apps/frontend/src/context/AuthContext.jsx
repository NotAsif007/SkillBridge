import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify user on mount or token change
  const fetchCurrentUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      console.warn('Authentication verification failed:', err.message || err);
      setUser(null);
      localStorage.removeItem('token');
      setToken(null);
      setAuthError(err.message || 'Session expired. Please log in.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    fetchCurrentUser(storedToken);
  }, [fetchCurrentUser]);

  const handleLoginSuccess = (newToken, userData) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (userData) {
      setUser(userData);
    }
    setAuthError(null);
  };

  const loginWithGoogle = async (idToken) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await authApi.loginWithGoogle(idToken);
      if (res.success && res.data) {
        handleLoginSuccess(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Google login failed');
    } catch (err) {
      setAuthError(err.message || 'Failed to authenticate with Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const devLogin = async (credentials) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await authApi.devLogin(credentials);
      if (res.success && res.data) {
        handleLoginSuccess(res.data.token, res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message || 'Invalid login credentials');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout().catch(() => {});
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setAuthError(null);
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(user && token),
    isLoading,
    authError,
    loginWithGoogle,
    devLogin,
    logout,
    refreshUser: () => fetchCurrentUser(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}