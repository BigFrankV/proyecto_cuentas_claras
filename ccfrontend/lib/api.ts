import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================
// CONFIGURACIÓN BASE
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:3000';

console.log('🔧 API configurada con URL:', API_BASE_URL);

// ============================================
// CREAR INSTANCIA DE AXIOS
// ============================================

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // true si backend usa cookies; ok con tokens también
});

// ============================================
// INTERCEPTOR DE REQUEST - AGREGAR TOKEN
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Solo en el navegador
    if (typeof window !== 'undefined') {
      // Intentar obtener token de múltiples fuentes (compatibilidad)
      const token = 
        localStorage.getItem('token') || 
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log de requests en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!config.headers.Authorization
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPONSE - MANEJAR ERRORES
// ============================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de responses exitosas en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data
      });
    }

    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    console.error('❌ API Error:', {
      status,
      method,
      url,
      message: getErrorMessage(error)
    });

    // ============================================
    // MANEJO DE ERRORES POR CÓDIGO
    // ============================================

    // 401 - No autorizado (token inválido/expirado)
    if (status === 401) {
      console.warn('⚠️ Token inválido o expirado - Limpiando sesión');
      
      if (typeof window !== 'undefined') {
        // Limpiar tokens de todas las fuentes
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_data');
        sessionStorage.clear();
        
        // Solo redirigir si no estamos ya en login
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/register') && 
            !currentPath.includes('/forgot-password') &&
            !currentPath.includes('/reset-password')) {
          
          // Guardar ruta actual para redirigir después del login
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          
          window.location.href = '/login';
        }
      }
    }

    // 403 - Acceso denegado (sin permisos)
    if (status === 403) {
      console.error('🚫 Acceso denegado - Sin permisos suficientes');
      
      if (typeof window !== 'undefined') {
        // Mostrar mensaje de error (puedes usar un toast aquí)
        alert('No tienes permisos para realizar esta acción');
      }
    }

    // 404 - No encontrado
    if (status === 404) {
      console.warn('🔍 Recurso no encontrado:', url);
    }

    // 422 - Datos inválidos
    if (status === 422) {
      console.warn('⚠️ Datos de entrada inválidos');
    }

    // 500 - Error del servidor
    if (status === 500) {
      console.error('💥 Error interno del servidor');
    }

    // Network error (sin respuesta del servidor)
    if (!error.response) {
      console.error('🌐 Error de conexión - El servidor no responde');
    }

    return Promise.reject(error);
  }
);

// ============================================
// FUNCIÓN PARA EXTRAER MENSAJES DE ERROR
// ============================================

function getErrorMessage(error: AxiosError): string {
  // Si hay respuesta del servidor
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Diferentes formatos de error del backend
    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    if (data.message) return data.message;
    if (data.msg) return data.msg;
    
    // Array de errores de validación
    if (Array.isArray(data.errors)) {
      return data.errors
        .map((err: any) => err.msg || err.message || JSON.stringify(err))
        .join(', ');
    }
    
    // Objeto con errores por campo
    if (typeof data === 'object' && data !== null) {
      const errors = Object.entries(data)
        .filter(([key]) => key !== 'success' && key !== 'statusCode')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      if (errors) return errors;
    }
  }
  
  // Mensajes por defecto según código de estado
  const status = error.response?.status;
  switch (status) {
    case 400:
      return 'Solicitud inválida';
    case 401:
      return 'No autorizado - Token inválido o expirado';
    case 403:
      return 'Acceso denegado - Sin permisos';
    case 404:
      return 'Recurso no encontrado';
    case 409:
      return 'Conflicto - El recurso ya existe';
    case 422:
      return 'Datos de entrada inválidos';
    case 429:
      return 'Demasiadas solicitudes - Intenta más tarde';
    case 500:
      return 'Error interno del servidor';
    case 502:
      return 'Error de gateway';
    case 503:
      return 'Servicio no disponible';
    case 504:
      return 'Timeout del gateway';
    default:
      return error.message || 'Error de conexión';
  }
}

// ============================================
// UTILIDADES DE API (HELPERS)
// ============================================

export const apiUtils = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, config);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, data, config);
  },

  /**
   * PUT request (reemplazar recurso completo)
   */
  put: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.put<T>(url, data, config);
  },

  /**
   * PATCH request (actualizar parcialmente)
   */
  patch: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.patch<T>(url, data, config);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    return api.delete<T>(url, config);
  },

  /**
   * Upload de archivos (FormData)
   */
  upload: <T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * Download de archivos
   */
  download: async (url: string, filename?: string): Promise<void> => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Crear URL del blob
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      // Crear link temporal y hacer click
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      throw error;
    }
  },

  /**
   * Obtener mensaje de error formateado
   */
  getErrorMessage,

  /**
   * Verificar si hay conexión
   */
  async checkConnection(): Promise<boolean> {
    try {
      await api.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('❌ Sin conexión con el servidor');
      return false;
    }
  },

  /**
   * Configurar token manualmente
   */
  setToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
        console.log('✅ Token configurado');
      } else {
        localStorage.removeItem('token');
        console.log('🗑️ Token eliminado');
      }
    }
  },

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || 
             localStorage.getItem('auth_token') ||
             sessionStorage.getItem('token');
    }
    return null;
  },

  /**
   * Limpiar autenticación
   */
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_data');
      sessionStorage.clear();
      console.log('🗑️ Autenticación limpiada');
    }
  }
};

// ============================================
// TIPOS Y INTERFACES PARA RESPUESTAS
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  status?: number;
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default api;

// ============================================
// EXPORT DE FUNCIONES ÚTILES
// ============================================

export { getErrorMessage };

// ============================================
// CONSTANTES DE ENDPOINTS (OPCIONAL)
// ============================================

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_2FA: '/auth/verify-2fa',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
  },
  
  // Comunidades
  COMUNIDADES: '/comunidades',
  
  // Edificios
  EDIFICIOS: '/edificios',
  
  // Gastos
  GASTOS: '/gastos',
  
  // Multas
  MULTAS: '/multas',
  
  // Personas
  PERSONAS: '/personas',
  
  // Proveedores
  PROVEEDORES: '/proveedores',
  
  // ... agregar más según necesites
} as const;