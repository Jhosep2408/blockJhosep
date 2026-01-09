// A
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const importantDatesApi = {
  getAll: (params = {}) => api.get('/important-dates', { params }),
  getUpcoming: (days = 7) => api.get(`/important-dates/upcoming?days=${days}`),
  getById: (id) => api.get(`/important-dates/${id}`),
  create: (data) => api.post('/important-dates', data),
  update: (id, data) => api.put(`/important-dates/${id}`, data),
  delete: (id) => api.delete(`/important-dates/${id}`)
};
// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export { importantDatesApi };
export default api;