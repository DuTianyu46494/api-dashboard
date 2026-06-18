import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }),
};

// API配置
export const configAPI = {
  getAll: () => api.get('/configs'),
  create: (data: any) => api.post('/configs', data),
  update: (id: number, data: any) => api.put(`/configs/${id}`, data),
  delete: (id: number) => api.delete(`/configs/${id}`),
};

// 使用量统计
export const usageAPI = {
  getStats: () => api.get('/usage/stats'),
  getModels: () => api.get('/usage/models'),
  getHistory: (days?: number) => api.get('/usage/history', { params: { days } }),
  record: (data: any) => api.post('/usage/record', data),
};

// 告警
export const alertAPI = {
  getAll: () => api.get('/alerts'),
  getUnreadCount: () => api.get('/alerts/unread-count'),
  markAsRead: (id: number) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  checkBudget: () => api.post('/alerts/check-budget'),
};

export default api;
