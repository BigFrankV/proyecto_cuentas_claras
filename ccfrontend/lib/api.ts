import axios from 'axios';

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
    const token = localStorage.getItem('auth_token');
    console.log('🔐 [API Request] Ruta:', config.url);
    console.log('🔐 [API Request] Token presente:', !!token);
    console.log('🔐 [API Request] Base URL:', config.baseURL);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 [API Request] Token agregado al header');
    } else {
      console.warn('🔐 [API Request] ⚠️ NO HAY TOKEN en localStorage');
    }
    
    return config;
  },
  error => {
    console.error('🔐 [API Request Error]:', error);
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  response => {
    console.log('✅ [API Response] Ruta:', response.config.url);
    console.log('✅ [API Response] Status:', response.status);
    console.log('✅ [API Response] Data:', response.data);
    return response;
  },
  error => {
    console.error('❌ [API Error] Ruta:', error.config?.url);
    console.error('❌ [API Error] Status:', error.response?.status);
    console.error('❌ [API Error] Error message:', error.message);
    console.error('❌ [API Error] Response data:', error.response?.data);
    console.error('❌ [API Error] Code:', error.code);
    
    // Si el token expiró o no existe, limpiar y redirigir
    if (error.response?.status === 401) {
      console.error('❌ [API Error] 401 - No autorizado, limpiando sesión...');
      
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
        
        // Redirigir SOLO si no estamos ya en la página de login
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/login') {
          console.error('❌ [API Error] Redirigiendo a login...');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
export { API_BASE_URL };
