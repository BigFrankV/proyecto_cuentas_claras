import {
  CategoriaGasto,
  CategoriaGastoDetalle,
  UltimoGasto,
  EstadisticasGenerales,
  EstadisticaPorTipo,
  CategoriaMasUtilizada,
  CategoriasResponse,
  CategoriasFiltradasRequest,
  CrearCategoriaRequest,
  ActualizarCategoriaRequest,
  DashboardResumen,
  DashboardTopMes,
  DashboardSinUsoReciente,
  DashboardDistribucionTipo,
} from '@/types/categoriasGasto';

// Base URL para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores de API
const handleApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      apiError.response?.data?.error || 'Error de conexión con el servidor'
    );
  }
  throw new Error('Error de conexión con el servidor');
};

// Helper para hacer peticiones autenticadas
const apiRequest = async (
  url: string,
  options: Record<string, unknown> = {}
) => {
  // Obtener token directamente de localStorage para evitar problemas de importación
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!token) {
    throw new Error('Missing token');
  }

  const config: Record<string, unknown> = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, unknown>) || {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

// =============================================================================
// CATEGORÍAS DE GASTO - Módulo API Completo
// =============================================================================

export const categoriasGastoApi = {
  // =========================================
  // 1. LISTADOS Y FILTROS
  // =========================================

  // Listar categorías básicas por comunidad
  getByComunidad: async (comunidadId: number): Promise<CategoriaGasto[]> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/comunidad/${comunidadId}`
      );
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Listar categorías con filtros avanzados y paginación
  getFiltradas: async (
    comunidadId: number,
    filtros?: CategoriasFiltradasRequest
  ): Promise<CategoriasResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filtros?.nombre_busqueda) {
        queryParams.append('nombre_busqueda', filtros.nombre_busqueda);
      }

      if (filtros?.tipo_filtro) {
        queryParams.append('tipo_filtro', filtros.tipo_filtro);
      }

      if (filtros?.activa_filtro !== undefined) {
        queryParams.append('activa_filtro', filtros.activa_filtro);
      }

      const limit = filtros?.limit || 50;
      const offset = filtros?.offset || 0;
      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const url = `/categorias-gasto/comunidad/${comunidadId}/filtrar?${queryParams.toString()}`;
      const response = await apiRequest(url);

      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 2. DETALLE DE CATEGORÍA
  // =========================================

  // Obtener detalle completo de una categoría
  getDetalle: async (id: number): Promise<CategoriaGastoDetalle> => {
    try {
      const data = await apiRequest(`/categorias-gasto/${id}/detalle`);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener últimos gastos asociados a la categoría
  getUltimosGastos: async (id: number, limit = 10): Promise<UltimoGasto[]> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/${id}/ultimos-gastos?limit=${limit}`
      );
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener categoría específica
  getById: async (id: number): Promise<CategoriaGasto> => {
    try {
      const data = await apiRequest(`/categorias-gasto/${id}`);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 3. OPERACIONES CRUD
  // =========================================

  // Crear nueva categoría
  create: async (
    comunidadId: number,
    categoria: CrearCategoriaRequest
  ): Promise<CategoriaGasto> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/comunidad/${comunidadId}`,
        {
          method: 'POST',
          body: JSON.stringify(categoria),
        }
      );
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Actualizar categoría
  update: async (
    id: number,
    categoria: ActualizarCategoriaRequest
  ): Promise<CategoriaGasto> => {
    try {
      const data = await apiRequest(`/categorias-gasto/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(categoria),
      });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Eliminar categoría
  delete: async (id: number, comunidadId?: number): Promise<void> => {
    try {
      const url = comunidadId
        ? `/categorias-gasto/${id}?comunidad_id=${comunidadId}`
        : `/categorias-gasto/${id}`;

      await apiRequest(url, {
        method: 'DELETE',
      });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Activar/Desactivar categoría
  toggleActiva: async (
    id: number,
    activa: boolean,
    comunidadId?: number
  ): Promise<CategoriaGasto> => {
    try {
      const body: { activa: boolean; comunidad_id?: number } = { activa };
      if (comunidadId) {
        body.comunidad_id = comunidadId;
      }

      const data = await apiRequest(`/categorias-gasto/${id}/toggle-activa`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 4. ESTADÍSTICAS Y REPORTES
  // =========================================

  // Estadísticas generales
  getEstadisticasGenerales: async (
    comunidadId: number
  ): Promise<EstadisticasGenerales> => {
    try {
      const url = `/categorias-gasto/comunidad/${comunidadId}/estadisticas/generales`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas por tipo
  getEstadisticasPorTipo: async (
    comunidadId: number
  ): Promise<EstadisticaPorTipo[]> => {
    try {
      const url = `/categorias-gasto/comunidad/${comunidadId}/estadisticas/por-tipo`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Categorías más utilizadas
  getMasUtilizadas: async (
    comunidadId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<CategoriaMasUtilizada[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (fechaInicio) {
        queryParams.append('fecha_inicio', fechaInicio);
      }
      if (fechaFin) {
        queryParams.append('fecha_fin', fechaFin);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/categorias-gasto/comunidad/${comunidadId}/mas-utilizadas?${queryString}`
        : `/categorias-gasto/comunidad/${comunidadId}/mas-utilizadas`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Categorías más costosas
  getMasCostosas: async (
    comunidadId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<CategoriaMasUtilizada[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (fechaInicio) {
        queryParams.append('fecha_inicio', fechaInicio);
      }
      if (fechaFin) {
        queryParams.append('fecha_fin', fechaFin);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/categorias-gasto/comunidad/${comunidadId}/mas-costosas?${queryString}`
        : `/categorias-gasto/comunidad/${comunidadId}/mas-costosas`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Categorías sin uso en período
  getSinUso: async (
    comunidadId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<CategoriaGasto[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (fechaInicio) {
        queryParams.append('fecha_inicio', fechaInicio);
      }
      if (fechaFin) {
        queryParams.append('fecha_fin', fechaFin);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/categorias-gasto/comunidad/${comunidadId}/sin-uso?${queryString}`
        : `/categorias-gasto/comunidad/${comunidadId}/sin-uso`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 5. VALIDACIONES
  // =========================================

  // Verificar si existe una categoría
  existe: async (id: number): Promise<boolean> => {
    try {
      await apiRequest(`/categorias-gasto/${id}/existe`);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      handleApiError(error);
      throw error;
    }
  },

  // Validar nombre único
  validarNombre: async (
    comunidadId: number,
    nombre: string,
    excludeId?: number
  ): Promise<boolean> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('nombre', nombre);
      if (excludeId) {
        queryParams.append('exclude_id', excludeId.toString());
      }

      const queryString = queryParams.toString();
      const url = `/categorias-gasto/comunidad/${comunidadId}/validar-nombre?${queryString}`;
      await apiRequest(url);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        return false;
      }
      handleApiError(error);
      throw error;
    }
  },

  // Verificar si tiene gastos asociados
  tieneGastos: async (id: number): Promise<boolean> => {
    try {
      const data = await apiRequest(`/categorias-gasto/${id}/tiene-gastos`);
      return data.tiene_gastos;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Validar tipo
  validarTipo: async (tipo: string): Promise<boolean> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/validar-tipo?tipo=${tipo}`
      );
      return data.valido;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 6. LISTAS DESPLEGABLES
  // =========================================

  // Lista de categorías activas
  getActivas: async (comunidadId: number): Promise<CategoriaGasto[]> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/comunidad/${comunidadId}/activas`
      );
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Lista de tipos disponibles
  getTipos: async (comunidadId: number): Promise<string[]> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/comunidad/${comunidadId}/tipos`
      );
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Lista de categorías por tipo específico
  getPorTipo: async (
    comunidadId: number,
    tipo: string
  ): Promise<CategoriaGasto[]> => {
    try {
      const data = await apiRequest(
        `/categorias-gasto/comunidad/${comunidadId}/por-tipo/${tipo}`
      );
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 7. DASHBOARD
  // =========================================

  // Resumen para dashboard
  getDashboardResumen: async (
    comunidadId: number
  ): Promise<DashboardResumen> => {
    try {
      const url = `/categorias-gasto/comunidad/${comunidadId}/dashboard/resumen`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Top categorías por gasto en el último mes
  getDashboardTopMes: async (
    comunidadId: number
  ): Promise<DashboardTopMes[]> => {
    try {
      const url = `/categorias-gasto/comunidad/${comunidadId}/dashboard/top-mes`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Categorías activas sin uso reciente
  getDashboardSinUsoReciente: async (
    comunidadId: number
  ): Promise<DashboardSinUsoReciente[]> => {
    try {
      const url = `/categorias-gasto/comunidad/${comunidadId}/dashboard/sin-uso-reciente`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Distribución de gastos por tipo
  getDashboardDistribucionTipo: async (
    comunidadId: number
  ): Promise<DashboardDistribucionTipo[]> => {
    try {
      const url = `/categorias-gasto/comunidad/${comunidadId}/dashboard/distribucion-tipo`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
