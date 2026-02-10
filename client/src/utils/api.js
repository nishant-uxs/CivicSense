import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

axios.defaults.baseURL = API_URL;

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const complaintsAPI = {
  getAll: (params) => axios.get('/complaints', { params }),
  getById: (id) => axios.get(`/complaints/${id}`),
  create: (formData) => axios.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  vote: (id) => axios.post(`/complaints/${id}/vote`),
  getNearby: (lng, lat, maxDistance) => axios.get('/complaints/nearby', {
    params: { lng, lat, maxDistance }
  })
};

export const adminAPI = {
  verify: (id) => axios.patch(`/admin/${id}/verify`),
  updateStatus: (id, status) => axios.patch(`/admin/${id}/status`, { status }),
  resolve: (id, formData) => axios.patch(`/admin/${id}/resolve`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => axios.delete(`/admin/${id}`),
  getAnomalies: () => axios.get('/admin/anomalies')
};

export const analyticsAPI = {
  get: (params) => axios.get('/analytics', { params })
};

export const aiAPI = {
  analyze: (data) => axios.post('/ai/analyze', data),
  duplicates: (data) => axios.post('/ai/duplicates', data),
  summary: (data) => axios.post('/ai/summary', data),
  imageAnalyze: (data) => axios.post('/ai/image-analyze', data),
  chat: (message) => axios.post('/ai/chat', { message })
};

export const leaderboardAPI = {
  get: () => axios.get('/leaderboard')
};

export const commentsAPI = {
  getAll: (complaintId) => axios.get(`/comments/${complaintId}`),
  create: (complaintId, text) => axios.post(`/comments/${complaintId}`, { text })
};

export const userAPI = {
  getProfile: () => axios.get('/users/profile'),
  updateProfile: (data) => axios.patch('/users/profile', data)
};

export default axios;
