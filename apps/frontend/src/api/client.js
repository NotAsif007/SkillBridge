import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
    return Promise.reject(customError);
  }
);

export default api;
