import {
  CompraBackend,
  ComprasResponse,
  CompraFilters,
  ComprasEstadisticas,
} from '@/types/compras';

// Base URL para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores de API
const handleApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { error?: string } } };
    throw new Error(apiError.response?.data?.error || 'Error de conexión con el servidor');
  }
  throw new Error('Error de conexión con el servidor');
};

// Helper para hacer peticiones autenticadas
const apiRequest = async (url: string, options: Record<string, unknown> = {}) => {
  // Obtener token directamente de localStorage para evitar problemas de importación
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!token) {
    throw new Error('Missing token');
  }

  const config: Record<string, unknown> = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, unknown> || {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// =============================================================================
// COMPRAS - Módulo API Completo
// =============================================================================

export const comprasApi = {
  // =========================================
  // 1. LISTADOS Y FILTROS
  // =========================================

  // Listar compras con filtros y paginación
  getAll: async (filters?: CompraFilters): Promise<ComprasResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.tipo_doc) {
        params.append('tipo_doc', filters.tipo_doc);
      }
      if (filters?.fecha_desde) {
        params.append('fecha_desde', filters.fecha_desde);
      }
      if (filters?.fecha_hasta) {
        params.append('fecha_hasta', filters.fecha_hasta);
      }
      if (filters?.comunidad_id) {
        params.append('comunidad_id', filters.comunidad_id.toString());
      }

      // Paginación
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      params.append('limit', limit.toString());
      params.append('page', (Math.floor(offset / limit) + 1).toString());

      const queryString = params.toString();
      const url = queryString ? `/compras?${queryString}` : '/compras';

      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 2. DETALLE DE COMPRA
  // =========================================

  // Obtener detalle de una compra específica
  getById: async (id: number): Promise<CompraBackend> => {
    try {
      const data = await apiRequest(`/compras/${id}`);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 3. OPERACIONES CRUD
  // =========================================

  // Crear nueva compra
  create: async (compra: Partial<CompraBackend>): Promise<CompraBackend> => {
    try {
      const data = await apiRequest('/compras', {
        method: 'POST',
        body: JSON.stringify(compra),
      });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Actualizar compra
  update: async (id: number, compra: Partial<CompraBackend>): Promise<CompraBackend> => {
    try {
      const data = await apiRequest(`/compras/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(compra),
      });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Eliminar compra
  delete: async (id: number): Promise<void> => {
    try {
      await apiRequest(`/compras/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 4. ESTADÍSTICAS Y REPORTES
  // =========================================

  // Estadísticas generales de compras
  getEstadisticas: async (comunidadId?: number): Promise<ComprasEstadisticas> => {
    try {
      const params = new URLSearchParams();
      if (comunidadId) {
        params.append('comunidad_id', comunidadId.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `/compras/estadisticas?${queryString}` : '/compras/estadisticas';

      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};