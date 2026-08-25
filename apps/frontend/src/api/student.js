import api from './client';

export const studentApi = {
  getDashboard: () => api.get('/dashboard/student'),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  addSkill: (data) => api.post('/profile/skills', data),
  setTargetCareer: (careerId) => api.put('/profile/target-career', { careerId }),
  getCareers: () => api.get('/careers'),
  getCareerDetails: (id) => api.get(`/careers/${id}`),
  getSkills: (params) => api.get('/skills', { params }),
  getCareerAnalysis: () => api.get('/career-analysis'),
  getAssessments: (params) => api.get('/assessments', { params }),
  startAssessment: (id) => api.get(`/assessments/${id}`),
  submitAssessment: (id, data) => api.post(`/assessments/${id}/submit`, data),
  getRoadmap: () => api.get('/roadmaps/me'),
  toggleTask: (taskId, isCompleted) => api.put(`/roadmaps/tasks/${taskId}/toggle`, { isCompleted }),
  getProjects: () => api.get('/projects'),
  createProject: (data) => api.post('/projects', data),
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  startInterview: (data) => api.post('/interviews', data),
  submitInterviewAnswer: (id, data) => api.post(`/interviews/${id}/answer`, data),
  getJobs: (params) => api.get('/jobs', { params }),
  applyJob: (id) => api.post(`/jobs/${id}/apply`),
};
