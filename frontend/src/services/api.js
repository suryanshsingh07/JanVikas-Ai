import axios from 'axios';
import { API_URL } from '../constants';
import toast from 'react-hot-toast';

// Create base axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
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

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response.data, // Strip axios wrapper and return direct data
  (error) => {
    // Check if network error (server down)
    if (!error.response) {
      toast.error('Network error. Is the server running?');
      return Promise.reject({ message: 'Network error' });
    }

    const status = error.response.status;
    const data = error.response.data;
    const message = data.message || 'An unexpected error occurred';

    // Auto logout on 401 Unauthorized
    if (status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      // Redirect to login handled by AuthContext usually, but we could force reload here
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    // Don't toast validation errors globally (let components handle them)
    // Also don't toast 404 errors - they're often expected and handled by components
    if (status !== 422 && status !== 401 && status !== 404) {
      toast.error(message);
    }

    return Promise.reject(data);
  }
);

export default api;
