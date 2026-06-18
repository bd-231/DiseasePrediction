import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(r => r, (error) => {
  if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }
  return Promise.reject(error);
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};
export const adminAPI = {
  createDoctor: (data) => api.post('/admin/users/doctor', data),
  createPatient: (data) => api.post('/admin/users/patient', data),
  getUsers: (role) => api.get('/admin/users', { params: role ? { role } : {} }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  resetPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
};
export const patientAPI = {
  getSymptoms: () => api.get('/patient/symptoms'),
  submitCase: (data) => api.post('/patient/cases', data),
  getCases: () => api.get('/patient/cases'),
  getCase: (id) => api.get(`/patient/cases/${id}`),
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.patch('/patient/profile', data),
  getNotifications: () => api.get('/patient/notifications'),
};
export const doctorAPI = {
  getQueue: () => api.get('/doctor/queue'),
  getReviewed: () => api.get('/doctor/reviewed'),
  getCase: (id) => api.get(`/doctor/cases/${id}`),
  approveCase: (id) => api.post(`/doctor/cases/${id}/approve`),
  modifyCase: (id, data) => api.post(`/doctor/cases/${id}/modify`, data),
  rejectCase: (id, data) => api.post(`/doctor/cases/${id}/reject`, data),
  getPatientHistory: (id) => api.get(`/doctor/patients/${id}/history`),
};
export default api;
