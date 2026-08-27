import api, { CACHE_TTL } from './client';

export const studentApi = {
  // Read operations (Cached with SWR)
  getDashboard: () => api.cachedGet('/dashboard/student', {}, CACHE_TTL.STANDARD),
  getProfile: () => api.cachedGet('/profile', {}, CACHE_TTL.DYNAMIC),
  getCareers: () => api.cachedGet('/careers', {}, CACHE_TTL.STATIC),
  getCareerDetails: (id) => api.cachedGet(`/careers/${id}`, {}, CACHE_TTL.STATIC),
  getSkills: (params) => api.cachedGet('/skills', { params }, CACHE_TTL.STATIC),
  getCareerAnalysis: () => api.cachedGet('/career-analysis', {}, CACHE_TTL.DYNAMIC),
  getAssessments: (params) => api.cachedGet('/assessments', { params }, CACHE_TTL.STANDARD),
  getRoadmap: () => api.cachedGet('/roadmaps/me', {}, CACHE_TTL.DYNAMIC),
  getProjects: () => api.cachedGet('/projects', {}, CACHE_TTL.STANDARD),
  getJobs: (params) => api.cachedGet('/jobs', { params }, CACHE_TTL.STANDARD),

  // Uncached & Mutating operations
  startAssessment: (id) => api.get(`/assessments/${id}`),
  updateProfile: (data) => api.put('/profile', data),
  addSkill: (data) => api.post('/profile/skills', data),
  setTargetCareer: (careerId) => api.put('/profile/target-career', { careerId }),
  submitAssessment: (id, data) => api.post(`/assessments/${id}/submit`, data),
  toggleTask: (taskId, isCompleted) => api.put(`/roadmaps/tasks/${taskId}/toggle`, { isCompleted }),
  createProject: (data) => api.post('/projects', data),
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  startInterview: (data) => api.post('/interviews', data),
  submitInterviewAnswer: (id, data) => api.post(`/interviews/${id}/answer`, data),
  applyJob: (id) => api.post(`/jobs/${id}/apply`),
};
