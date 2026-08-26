import api from './client';

export const authApi = {
  /**
   * Authenticate via Google OAuth ID Token
   */
  loginWithGoogle: (idToken) => api.post('/auth/google', { idToken }),

  /**
   * Fast Development / Demo Login
   */
  devLogin: (credentials) => api.post('/auth/dev-login', credentials),

  /**
   * Fetch current authenticated user session
   */
  getMe: () => api.get('/auth/me'),

  /**
   * Invalidate session and logout
   */
  logout: () => api.post('/auth/logout'),
};