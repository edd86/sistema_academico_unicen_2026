import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('unicen_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si la petición no es de login y da 401, limpiar sesión
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('unicen_token');
        localStorage.removeItem('unicen_user');
      }
    }
    return Promise.reject(error);
  },
);
