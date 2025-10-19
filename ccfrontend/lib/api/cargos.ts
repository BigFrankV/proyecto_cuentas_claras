import {
  Cargo,
  CargoFormData,
  CargoFilters,
  CargoDetalle,
} from '@/types/cargos';

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
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  console.log(
    '🔐 Token obtenido para API:',
    token ? 'Token presente' : 'No hay token',
  );
  console.log('🔐 URL de la petición:', `${API_BASE_URL}${url}`);

  if (!token) {
    console.error('❌ No se pudo obtener token para la petición');
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

  console.log('🔐 Headers de la petición:', config.headers);

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
};

// =============================================================================
// CARGOS - CRUD Principal
// =============================================================================

export const cargosApi = {
  // Crear un nuevo cargo
  create: async (cargoData: CargoFormData): Promise<Cargo> => {
    try {
      console.log('📝 Creando cargo:', cargoData);
      const data = await apiRequest('/cargos', {
        method: 'POST',
        body: JSON.stringify(cargoData),
      });

      // Mapear la respuesta del backend al formato del frontend
      return {
        id: data.id,
        concepto: data.concepto,
        descripcion: data.descripcion,
        tipo: data.tipo,
        estado: data.estado,
        monto: data.monto,
        unidad: data.unidad,
        periodo: data.periodo,
        fechaVencimiento: new Date(data.fecha_vencimiento),
        fechaCreacion: new Date(data.fecha_creacion),
        nombreComunidad: data.nombre_comunidad,
        propietario: data.propietario,
        saldo: data.saldo,
        interesAcumulado: data.interes_acumulado,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener todos los cargos de una comunidad con filtros
  getByComunidad: async (
    comunidadId: number,
    filters?: CargoFilters,
  ): Promise<Cargo[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('comunidadId', comunidadId.toString());

      if (filters?.estado) {
        queryParams.append('estado', filters.estado);
      }
      if (filters?.unidad) {
        queryParams.append('unidad', filters.unidad.toString());
      }
      if (filters?.periodo) {
        queryParams.append('periodo', filters.periodo);
      }
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const url = `/cargos/comunidad/${comunidadId}?${queryParams.toString()}`;
      const data = await apiRequest(url);

      // Mapear la respuesta del backend al formato del frontend
      return data.map((cargo: any) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado: cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        propietario: cargo.propietario,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener detalle de un cargo específico
  getById: async (id: number): Promise<CargoDetalle> => {
    try {
      const data = await apiRequest(`/cargos/${id}`);

      // Mapear la respuesta del backend al formato del frontend
      return {
        id: data.id,
        concepto: data.concepto,
        descripcion: data.descripcion,
        tipo: data.tipo,
        estado: data.estado,
        monto: data.monto,
        unidad: data.unidad,
        periodo: data.periodo,
        fechaVencimiento: new Date(data.fecha_vencimiento),
        fechaCreacion: new Date(data.fecha_creacion),
        nombreComunidad: data.nombre_comunidad,
        propietario: data.propietario,
        emailPropietario: data.email_propietario,
        telefonoPropietario: data.telefono_propietario,
        saldo: data.saldo,
        interesAcumulado: data.interes_acumulado,
        // TODO: Agregar pagos, documentos e historial cuando estén disponibles en el backend
        pagos: [],
        documentos: [],
        historial: [],
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos de una unidad específica
  getByUnidad: async (unidadId: number): Promise<Cargo[]> => {
    try {
      const data = await apiRequest(`/cargos/unidad/${unidadId}`);

      // Mapear la respuesta del backend al formato del frontend
      return data.map((cargo: any) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado: cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
