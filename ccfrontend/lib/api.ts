import axios from 'axios';

import authService from './auth';

// Configuración base de la API - usa la variable de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_FULL_URL = `${API_BASE_URL}`;

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_FULL_URL,
  timeout: 30000, // Aumentado a 30 segundos para operaciones de sincronización
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  config => {
    const token =
      authService.getToken?.() || localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas y errores
let isHandling401 = false;
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error?.response?.status;
    if (status === 401) {
      if (!isHandling401) {
        isHandling401 = true;
        try {
          // limpiar solo localmente (sin llamadas remotas ni redirecciones múltiples)
          authService.clearLocalAuth?.();
        } catch (e) {
          console.warn('⚠️ Error limpiando auth en interceptor 401:', e);
        }
        // Forzar una sola redirección/reload para que el SPA re-evalúe el estado
        if (typeof window !== 'undefined') {
          // replace evita acumular el historial
          window.location.replace('/');
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
export { API_BASE_URL };
