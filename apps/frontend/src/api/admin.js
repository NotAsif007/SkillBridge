import api from './client';

export const adminApi = {
  getDashboard: () => api.get('/dashboard/admin'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getDepartments: () => api.get('/admin/departments'),
};
