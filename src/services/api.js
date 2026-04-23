import axios from 'axios';
import useAuthStore from '../store/authStore';
import { isTokenValid } from '../utils/authSession';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const { token, logout } = useAuthStore.getState();

    if (token) {
      if (!isTokenValid(token)) {
        logout();
        return Promise.reject(new Error('Session expired. Please login again.'));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default api;
