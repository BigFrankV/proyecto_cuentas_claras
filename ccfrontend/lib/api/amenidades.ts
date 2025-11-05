/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import {
  Amenidad,
  AmenidadFormData,
  AmenidadFilters,
  ReservaAmenidad,
  ReservaAmenidadFormData,
} from '@/types/amenidades';

// Base URL para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores de API
const handleApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { error?: string } } };
    if (apiError.response?.data?.error) {
      throw new Error(apiError.response.data.error);
    }
  }
  throw new Error('Error de conexión con el servidor');
};

// Helper para hacer peticiones autenticadas
const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Obtener token directamente de localStorage para evitar problemas de importación
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!token) {
    throw new Error('Missing token');
  }

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  return response.json();
};

// =========================================
// AMENIDADES API
// =========================================

export const amenidades = {
  // Listar amenidades con filtros
  getAll: async (filters?: AmenidadFilters): Promise<Amenidad[]> => {
    try {
      const params = new URLSearchParams();

      if (filters?.comunidad_id) {
        params.append('comunidad_id', filters.comunidad_id.toString());
      }
      if (filters?.requiere_aprobacion !== undefined) {
        params.append(
          'requiere_aprobacion',
          filters.requiere_aprobacion.toString(),
        );
      }
      if (filters?.capacidad_min) {
        params.append('capacidad_min', filters.capacidad_min.toString());
      }
      if (filters?.capacidad_max) {
        params.append('capacidad_max', filters.capacidad_max.toString());
      }
      if (filters?.tarifa_min) {
        params.append('tarifa_min', filters.tarifa_min.toString());
      }
      if (filters?.tarifa_max) {
        params.append('tarifa_max', filters.tarifa_max.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `/amenidades${queryString ? `?${queryString}` : ''}`;

      return await apiRequest(url);
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Obtener amenidad por ID
  getById: async (id: string): Promise<Amenidad | null> => {
    try {
      return await apiRequest(`/amenidades/${id}`);
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Obtener detalle completo de amenidad
  getDetalle: async (id: string): Promise<Amenidad | null> => {
    try {
      return await apiRequest(`/amenidades/${id}/detalle`);
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Obtener amenidades por comunidad
  getByComunidad: async (comunidadId: number): Promise<Amenidad[]> => {
    try {
      return await apiRequest(`/amenidades/comunidad/${comunidadId}`);
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Crear amenidad
  create: async (data: AmenidadFormData): Promise<Amenidad | null> => {
    try {
      return await apiRequest(`/amenidades/comunidad/${data.comunidad_id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Actualizar amenidad
  update: async (
    id: string,
    data: Partial<AmenidadFormData>,
  ): Promise<Amenidad | null> => {
    try {
      return await apiRequest(`/amenidades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Eliminar amenidad
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/amenidades/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  // Buscar amenidades
  search: async (filters: AmenidadFilters): Promise<Amenidad[]> => {
    try {
      const params = new URLSearchParams();

      if (filters.busqueda) {
        params.append('busqueda', filters.busqueda);
      }
      if (filters.comunidad_id) {
        params.append('comunidad_id', filters.comunidad_id.toString());
      }
      if (filters.requiere_aprobacion !== undefined) {
        params.append(
          'requiere_aprobacion',
          filters.requiere_aprobacion.toString(),
        );
      }
      if (filters.capacidad_min) {
        params.append('capacidad_min', filters.capacidad_min.toString());
      }
      if (filters.tarifa_min) {
        params.append('tarifa_min', filters.tarifa_min.toString());
      }
      if (filters.tarifa_max) {
        params.append('tarifa_max', filters.tarifa_max.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `/amenidades/buscar${queryString ? `?${queryString}` : ''}`;

      return await apiRequest(url);
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Estadísticas
  getStats: async (): Promise<any> => {
    try {
      return await apiRequest('/amenidades/estadisticas/generales');
    } catch (error) {
      handleApiError(error);
      return {};
    }
  },
};

// =========================================
// RESERVAS DE AMENIDADES API
// =========================================

export const reservasAmenidades = {
  // Obtener reservas de una amenidad
  getByAmenidad: async (amenidadId: string): Promise<ReservaAmenidad[]> => {
    try {
      return await apiRequest(`/amenidades/${amenidadId}/reservas`);
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Crear reserva
  create: async (
    amenidadId: string,
    data: ReservaAmenidadFormData,
  ): Promise<ReservaAmenidad | null> => {
    try {
      return await apiRequest(`/amenidades/${amenidadId}/reservas`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Actualizar reserva
  update: async (
    id: string,
    data: Partial<ReservaAmenidadFormData>,
  ): Promise<ReservaAmenidad | null> => {
    try {
      return await apiRequest(`/reservas-amenidades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Eliminar reserva
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/reservas-amenidades/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  // Confirmar reserva
  confirm: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/reservas-amenidades/${id}/confirmar`, {
        method: 'PATCH',
      });
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  // Cancelar reserva
  cancel: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/reservas-amenidades/${id}/cancelar`, {
        method: 'PATCH',
      });
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
};

