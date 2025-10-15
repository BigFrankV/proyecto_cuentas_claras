import { 
  Edificio, 
  EdificioFormData, 
  EdificioFilters, 
  EdificioStats,
  Torre,
  TorreFormData,
  Unidad,
  UnidadFormData
} from '@/types/edificios';

// Base URL para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores de API
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error('Error de conexión con el servidor');
};

// Helper para hacer peticiones autenticadas
const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Obtener token directamente de localStorage para evitar problemas de importación
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  console.log('🔐 Token obtenido para API:', token ? 'Token presente' : 'No hay token');
  console.log('🔐 URL de la petición:', `${API_BASE_URL}${url}`);
  
  if (!token) {
    console.error('❌ No se pudo obtener token para la petición');
    throw new Error('Missing token');
  }

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  console.log('🔐 Headers de la petición:', config.headers);

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// =============================================================================
// EDIFICIOS - CRUD Principal
// =============================================================================

export const edificiosApi = {
  // Obtener todos los edificios con filtros
  getAll: async (filters?: EdificioFilters): Promise<Edificio[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.busqueda) queryParams.append('search', filters.busqueda);
      if (filters?.comunidadId) queryParams.append('comunidadId', filters.comunidadId);
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.tipo) queryParams.append('tipo', filters.tipo);
      if (filters?.fechaDesde) queryParams.append('fechaDesde', filters.fechaDesde);
      if (filters?.fechaHasta) queryParams.append('fechaHasta', filters.fechaHasta);

      const url = `/edificios${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const data = await apiRequest(url);
      
      // Mapear la respuesta del backend al formato del frontend
      return data.map((edificio: any) => ({
        id: edificio.id.toString(),
        nombre: edificio.nombre,
        codigo: edificio.codigo,
        direccion: edificio.direccion,
        comunidadId: edificio.comunidad_id?.toString(),
        comunidadNombre: edificio.comunidad_nombre,
        estado: edificio.estado,
        tipo: edificio.tipo || 'residencial',
        fechaCreacion: edificio.fecha_creacion,
        fechaActualizacion: edificio.fecha_actualizacion,
        anoConstructccion: edificio.ano_construccion,
        numeroTorres: edificio.numero_torres,
        totalUnidades: edificio.total_unidades,
        totalUnidadesOcupadas: edificio.unidades_activas,
        pisos: edificio.pisos,
        administrador: edificio.administrador,
        telefonoAdministrador: edificio.telefono_administrador,
        emailAdministrador: edificio.email_administrador,
        servicios: (() => {
          if (Array.isArray(edificio.servicios)) return edificio.servicios;
          if (typeof edificio.servicios === 'string' && edificio.servicios.trim()) {
            try { return JSON.parse(edificio.servicios); } catch { return []; }
          }
          return [];
        })(),
        amenidades: (() => {
          if (Array.isArray(edificio.amenidades)) return edificio.amenidades;
          if (typeof edificio.amenidades === 'string' && edificio.amenidades.trim()) {
            try { return JSON.parse(edificio.amenidades); } catch { return []; }
          }
          return [];
        })(),
        latitud: edificio.latitud,
        longitud: edificio.longitud,
        imagen: edificio.imagen,
        observaciones: edificio.observaciones,
        areaComun: edificio.area_comun,
        areaPrivada: edificio.area_privada,
        parqueaderos: edificio.parqueaderos,
        depositos: edificio.depositos
      }));
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Obtener edificio por ID
  getById: async (id: string): Promise<Edificio | null> => {
    try {
      const data = await apiRequest(`/edificios/${id}`);
      
      return {
        id: data.id.toString(),
        nombre: data.nombre,
        codigo: data.codigo,
        direccion: data.direccion,
        comunidadId: data.comunidad_id?.toString(),
        comunidadNombre: data.comunidad_nombre,
        estado: data.estado,
        tipo: data.tipo || 'residencial',
        fechaCreacion: data.fecha_creacion,
        fechaActualizacion: data.fecha_actualizacion,
        anoConstructccion: data.ano_construccion,
        numeroTorres: data.numero_torres,
        totalUnidades: data.total_unidades,
        totalUnidadesOcupadas: data.total_unidades_ocupadas,
        pisos: data.pisos,
        administrador: data.administrador,
        telefonoAdministrador: data.telefono_administrador,
        emailAdministrador: data.email_administrador,
        servicios: (() => {
          if (Array.isArray(data.servicios)) return data.servicios;
          if (typeof data.servicios === 'string' && data.servicios.trim()) {
            try { return JSON.parse(data.servicios); } catch { return []; }
          }
          return [];
        })(),
        amenidades: (() => {
          if (Array.isArray(data.amenidades)) return data.amenidades;
          if (typeof data.amenidades === 'string' && data.amenidades.trim()) {
            try { return JSON.parse(data.amenidades); } catch { return []; }
          }
          return [];
        })(),
        latitud: data.latitud,
        longitud: data.longitud,
        imagen: data.imagen,
        observaciones: data.observaciones,
        areaComun: data.area_comun,
        areaPrivada: data.area_privada,
        parqueaderos: data.parqueaderos,
        depositos: data.depositos
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Crear nuevo edificio
  create: async (data: EdificioFormData): Promise<Edificio | null> => {
    try {
      const payload = {
        nombre: data.nombre,
        codigo: data.codigo,
        direccion: data.direccion,
        comunidadId: parseInt(data.comunidadId),
        tipo: data.tipo,
        anoConstructccion: data.anoConstructccion,
        numeroTorres: data.numeroTorres,
        pisos: data.pisos,
        administrador: data.administrador,
        telefonoAdministrador: data.telefonoAdministrador,
        emailAdministrador: data.emailAdministrador,
        servicios: data.servicios,
        amenidades: data.amenidades,
        latitud: data.latitud,
        longitud: data.longitud,
        observaciones: data.observaciones,
        areaComun: data.areaComun,
        areaPrivada: data.areaPrivada,
        parqueaderos: data.parqueaderos,
        depositos: data.depositos
      };

      const result = await apiRequest('/edificios', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        id: result.id.toString(),
        nombre: result.nombre,
        codigo: result.codigo,
        direccion: result.direccion,
        comunidadId: result.comunidad_id?.toString(),
        comunidadNombre: result.comunidad_nombre,
        estado: 'activo',
        tipo: data.tipo,
        fechaCreacion: result.fecha_creacion,
        numeroTorres: data.numeroTorres,
        totalUnidades: 0,
        totalUnidadesOcupadas: 0,
        pisos: data.pisos
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Actualizar edificio
  update: async (id: string, data: Partial<EdificioFormData>): Promise<Edificio | null> => {
    try {
      const payload: any = {
        nombre: data.nombre,
        codigo: data.codigo,
        direccion: data.direccion,
        comunidadId: data.comunidadId,
      };
      
      // Campos opcionales
      if (data.anoConstructccion !== undefined) payload.anoConstructccion = data.anoConstructccion;
      if (data.pisos !== undefined) payload.pisos = data.pisos;
      if (data.administrador !== undefined) payload.administrador = data.administrador;
      if (data.telefonoAdministrador !== undefined) payload.telefonoAdministrador = data.telefonoAdministrador;
      if (data.emailAdministrador !== undefined) payload.emailAdministrador = data.emailAdministrador;
      if (data.servicios !== undefined) payload.servicios = data.servicios;
      if (data.amenidades !== undefined) payload.amenidades = data.amenidades;
      if (data.latitud !== undefined) payload.latitud = data.latitud;
      if (data.longitud !== undefined) payload.longitud = data.longitud;
      if (data.observaciones !== undefined) payload.observaciones = data.observaciones;
      if (data.areaComun !== undefined) payload.areaComun = data.areaComun;
      if (data.areaPrivada !== undefined) payload.areaPrivada = data.areaPrivada;
      if (data.parqueaderos !== undefined) payload.parqueaderos = data.parqueaderos;
      if (data.depositos !== undefined) payload.depositos = data.depositos;

      const result = await apiRequest(`/edificios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      return result;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Eliminar edificio
  delete: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/edificios/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      handleApiError(error);
    }
  },

  // Verificar dependencias antes de eliminar
  checkDependencies: async (id: string) => {
    try {
      return await apiRequest(`/edificios/${id}/check-dependencies`);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// =============================================================================
// ESTADÍSTICAS
// =============================================================================

export const edificiosStatsApi = {
  // Obtener estadísticas generales
  getStats: async (): Promise<EdificioStats | null> => {
    try {
      const data = await apiRequest('/edificios/stats');
      
      return {
        totalEdificios: data.total_edificios,
        edificiosActivos: data.edificios_activos,
        totalUnidades: data.total_unidades,
        unidadesOcupadas: data.unidades_ocupadas,
        ocupacion: data.ocupacion
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },

  // Obtener resumen de un edificio
  getResumen: async (id: string) => {
    try {
      return await apiRequest(`/edificios/${id}/resumen`);
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
};

// =============================================================================
// TORRES
// =============================================================================

export const torresApi = {
  // Obtener torres de un edificio
  getByEdificio: async (edificioId: string): Promise<Torre[]> => {
    try {
      const data = await apiRequest(`/edificios/${edificioId}/torres`);
      
      return data.map((torre: any) => ({
        id: torre.id.toString(),
        edificioId: torre.edificio_id.toString(),
        nombre: torre.nombre,
        codigo: torre.codigo,
        pisos: torre.pisos,
        unidadesPorPiso: torre.unidades_por_piso || 0,
        totalUnidades: torre.total_unidades,
        unidadesOcupadas: torre.unidades_ocupadas,
        estado: torre.estado,
        fechaCreacion: torre.fecha_creacion,
        observaciones: torre.observaciones
      }));
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Crear nueva torre
  create: async (edificioId: string, data: TorreFormData): Promise<Torre | null> => {
    try {
      const payload = {
        nombre: data.nombre,
        codigo: data.codigo,
        pisos: data.pisos,
        observaciones: data.observaciones
      };

      const result = await apiRequest(`/edificios/${edificioId}/torres`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        id: result.id.toString(),
        edificioId: result.edificio_id.toString(),
        nombre: result.nombre,
        codigo: result.codigo,
        pisos: result.pisos,
        unidadesPorPiso: 0,
        totalUnidades: result.total_unidades || 0,
        unidadesOcupadas: result.unidades_ocupadas || 0,
        estado: result.estado || 'activa',
        fechaCreacion: result.fecha_creacion,
        observaciones: result.observaciones
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
};

// =============================================================================
// UNIDADES
// =============================================================================

export const unidadesApi = {
  // Obtener unidades de un edificio
  getByEdificio: async (edificioId: string, torreId?: string): Promise<Unidad[]> => {
    try {
      const queryParams = torreId ? `?torreId=${torreId}` : '';
      const data = await apiRequest(`/edificios/${edificioId}/unidades${queryParams}`);
      
      return data.map((unidad: any) => ({
        id: unidad.id.toString(),
        edificioId: unidad.edificio_id.toString(),
        torreId: unidad.torre_id?.toString(),
        numero: unidad.numero,
        piso: unidad.piso || 1,
        tipo: 'apartamento',
        estado: unidad.estado,
        area: unidad.area,
        habitaciones: unidad.habitaciones,
        banos: unidad.banos,
        balcon: unidad.balcon,
        parqueadero: unidad.parqueadero,
        deposito: unidad.deposito,
        fechaCreacion: unidad.fecha_creacion,
        observaciones: unidad.observaciones
      }));
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Crear nueva unidad
  create: async (edificioId: string, data: UnidadFormData): Promise<Unidad | null> => {
    try {
      const payload = {
        codigo: data.numero,
        torre_id: data.torreId ? parseInt(data.torreId) : null,
        m2_utiles: data.area,
        m2_terrazas: data.balcon ? 10 : 0,
        nro_estacionamiento: data.parqueadero ? '1' : null,
        nro_bodega: data.deposito ? '1' : null,
        activa: true // Por defecto activa
      };

      const result = await apiRequest(`/edificios/${edificioId}/unidades`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        id: result.id.toString(),
        edificioId: result.edificio_id.toString(),
        torreId: result.torre_id?.toString(),
        numero: result.numero,
        piso: result.piso || 1,
        tipo: 'apartamento',
        estado: result.estado,
        area: result.area,
        fechaCreacion: result.fecha_creacion
      };
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
};

// =============================================================================
// UTILIDADES
// =============================================================================

export const edificiosUtilsApi = {
  // Búsqueda rápida
  search: async (query: string, limit = 10) => {
    try {
      return await apiRequest(`/edificios/buscar?q=${encodeURIComponent(query)}&limit=${limit}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Obtener opciones para formularios
  getComunidadesOpciones: async () => {
    try {
      return await apiRequest('/edificios/comunidades-opciones');
    } catch (error) {
      handleApiError(error);
    }
  },

  // Obtener servicios disponibles
  getServiciosDisponibles: async () => {
    try {
      return await apiRequest('/edificios/servicios');
    } catch (error) {
      handleApiError(error);
    }
  },

  // Obtener amenidades disponibles
  getAmenidadesDisponibles: async () => {
    try {
      return await apiRequest('/edificios/amenidades-disponibles');
    } catch (error) {
      handleApiError(error);
    }
  },

  // Validar código único
  validarCodigo: async (edificioId: string, codigo: string, tipo: 'edificio' | 'torre' | 'unidad') => {
    try {
      return await apiRequest(`/edificios/${edificioId}/validar-codigo?codigo=${encodeURIComponent(codigo)}&tipo=${tipo}`);
    } catch (error) {
      handleApiError(error);
    }
  },

  // Obtener opciones de filtros para un edificio
  getFiltrosOpciones: async (edificioId: string) => {
    try {
      return await apiRequest(`/edificios/${edificioId}/filtros-opciones`);
    } catch (error) {
      handleApiError(error);
    }
  }
};

// =============================================================================
// EXPORTACIONES PRINCIPALES
// =============================================================================

export default {
  edificios: edificiosApi,
  stats: edificiosStatsApi,
  torres: torresApi,
  unidades: unidadesApi,
  utils: edificiosUtilsApi
};