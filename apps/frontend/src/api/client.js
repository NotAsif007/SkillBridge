import axios from 'axios';
import { apiCache, CACHE_TTL } from './cache';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Invalidate relevant cache on mutating requests
    const method = response.config?.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const url = response.config?.url || '';
      if (url.includes('profile') || url.includes('target-career') || url.includes('skills')) {
        apiCache.invalidate(/profile|dashboard|career-analysis/);
      } else if (url.includes('projects')) {
        apiCache.invalidate(/projects|dashboard|career-analysis/);
      } else if (url.includes('assessments')) {
        apiCache.invalidate(/assessments|dashboard|career-analysis|profile/);
      } else if (url.includes('roadmaps')) {
        apiCache.invalidate(/roadmaps|dashboard/);
      } else if (url.includes('resumes')) {
        apiCache.invalidate(/resumes|dashboard|profile/);
      }
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      apiCache.clear();
    }

    const customError = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
    return Promise.reject(customError);
  }
);

/**
 * Cached GET request with Stale-While-Revalidate pattern.
 * If cached, returns immediately and revalidates in the background if stale.
 * 
 * @param {string} url 
 * @param {object} config 
 * @param {number} ttlMs 
 * @returns {Promise<any>}
 */
api.cachedGet = async (url, config = {}, ttlMs = CACHE_TTL.STANDARD) => {
  const cacheKey = `${url}:${JSON.stringify(config.params || {})}`;
  const cached = apiCache.get(cacheKey);

  if (cached && cached.data) {
    // If cache is stale, trigger silent background revalidation
    if (cached.isStale) {
      api.get(url, config)
        .then((fresh) => {
          if (fresh) apiCache.set(cacheKey, fresh, ttlMs);
        })
        .catch(() => {});
    }
    return cached.data;
  }

  // No cache present: fetch fresh and store
  const fresh = await api.get(url, config);
  if (fresh) {
    apiCache.set(cacheKey, fresh, ttlMs);
  }
  return fresh;
};

export { apiCache, CACHE_TTL };
export default api;