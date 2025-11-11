import axios from 'axios';

// Configuración base de la API - usa la variable de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'|| 'http://localhost:8081';
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
    const token = localStorage.getItem('auth_token');
    // eslint-disable-next-line no-console
    console.log('[API Request] Ruta:', config.url);
    // eslint-disable-next-line no-console
    console.log('[API Request] Token presente:', !!token);
    // eslint-disable-next-line no-console
    console.log('[API Request] Base URL:', config.baseURL);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      console.log('[API Request] Token agregado al header');
    } else {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.warn('[API Request] No hay token en localStorage');
    }

    // No sobrescribir Content-Type si es FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  error => {
    // eslint-disable-next-line no-console
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  response => {
    // eslint-disable-next-line no-console
    console.log('[API Response] Ruta:', response.config.url);
    // eslint-disable-next-line no-console
    console.log('[API Response] Status:', response.status);
    // eslint-disable-next-line no-console
    console.log('[API Response] Data:', response.data);
    return response;
  },
  error => {
    // eslint-disable-next-line no-console
    console.error('[API Error] Ruta:', error.config?.url);
    // eslint-disable-next-line no-console
    console.error('[API Error] Status:', error.response?.status);
    // eslint-disable-next-line no-console
    console.error('[API Error] Mensaje de error:', error.message);
    // eslint-disable-next-line no-console
    console.error('[API Error] Datos de respuesta:', error.response?.data);
    // eslint-disable-next-line no-console
    console.error('[API Error] Código:', error.code);

    // Si el token expiró o no existe, limpiar y redirigir
    if (error.response?.status === 401) {
      // eslint-disable-next-line no-console
      console.error('[API Error] 401 - No autorizado, limpiando sesión...');

      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');

        // Redirigir SOLO si no estamos ya en la página de login
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/login') {
          // eslint-disable-next-line no-console
          console.error('[API Error] Redirigiendo a login...');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
export { API_BASE_URL };
