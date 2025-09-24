import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
// Crear instancia de axios
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores globalmente
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
    }

    // Manejar otros errores
    const errorMessage = getErrorMessage(error);
    
    // Log del error para debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method
    });

    return Promise.reject(error);
  }
);

// Función para extraer mensajes de error
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Diferentes formatos de error que puede devolver el backend
    if (data.error) return data.error;
    if (data.message) return data.message;
    if (data.msg) return data.msg;
    
    // Si es un array de errores de validación
    if (Array.isArray(data.errors)) {
      return data.errors.map((err: any) => err.msg || err.message).join(', ');
    }
  }
  
  // Mensajes por defecto según el código de estado
  switch (error.response?.status) {
    case 400:
      return 'Solicitud inválida';
    case 401:
      return 'No autorizado';
    case 403:
      return 'Acceso denegado';
    case 404:
      return 'Recurso no encontrado';
    case 422:
      return 'Datos de entrada inválidos';
    case 500:
      return 'Error interno del servidor';
    default:
      return error.message || 'Error de conexión';
  }
}

// Funciones de utilidad para diferentes tipos de requests
export const apiUtils = {
  // GET request
  get: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, config);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, data, config);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.put<T>(url, data, config);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => {
    return api.delete<T>(url, config);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => {
    return api.patch<T>(url, data, config);
  }
};

// Export por defecto
export default api;
