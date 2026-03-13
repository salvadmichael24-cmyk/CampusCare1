import axios from 'axios';

// Use relative URLs so the proxy works
const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

const ADMIN_API = axios.create({
  baseURL: '',
  withCredentials: true,
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

ADMIN_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

ADMIN_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth and report endpoints
export const login = (username, password) => API.post('/login', { username, password });
export const register = (userData) => API.post('/register', userData);
export const logout = () => API.post('/logout');
export const getCurrentUser = () => API.get('/me');
export const updateProfile = (userData) => API.put('/profile', userData);
export const deleteReport = (id) => API.delete(`/reports/${id}`);

// Forgot Password endpoints
export const forgotPassword = (email) => API.post('/forgot-password', { email });
export const verifyCode = (email, code) => API.post('/verify-code', { email, code });
export const resetPasswordWithCode = (email, code, password) => API.post('/reset-password-with-code', { email, code, password });

export const getReports = async () => {
  try {
    const response = await API.get('/reports');
    return response;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const createReport = (formData) => {
  return API.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateReport = (id, data) => API.put(`/reports/${id}`, data);
export const getUserStatistics = () => API.get('/user/statistics');
export const getPublicStatistics = () => API.get('/statistics');

// Admin endpoints
export const getUsers = () => ADMIN_API.get('/admin/users');
export const toggleUser = (id) => ADMIN_API.post(`/admin/users/${id}/toggle`);
export const getStatistics = () => ADMIN_API.get('/admin/statistics');
export const getNewReportsCount = () => ADMIN_API.get('/api/reports/new/count');

// SIMPLE AND RELIABLE image URL function - uses current hostname
export const getImageUrl = (photoPath) => {
  if (!photoPath) return null;

  // Extract just the filename
  let filename = photoPath;
  if (photoPath.includes('\\')) {
    filename = photoPath.split('\\').pop();
  } else if (photoPath.includes('/')) {
    filename = photoPath.split('/').pop();
  }

  // Use relative URL - will go through proxy
  return `/static/uploads/${filename}`;
};
