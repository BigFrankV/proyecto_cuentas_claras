import apiClient from './api';

export interface Torre {
  id: number;
  nombre: string;
  codigo: string;
  edificio_id: number;
  nombreEdificio?: string;
  direccionEdificio?: string;
  nombreComunidad?: string;
  totalUnidades?: number;
  unidadesOcupadas?: number;
  numPisos?: number;
  fechaCreacion?: string;
  ultimaActualizacion?: string;
  superficieTotalUtil?: number;
  superficieTotalTerrazas?: number;
  superficieTotal?: number;
}

export interface TorreDetalle extends Torre {
  descripcion?: string;
  administrador?: string;
  anoConstruction?: number;
  unidadesPorPiso?: number;
}

export interface Unidad {
  id: number;
  numero: string;
  piso: number;
  tipo?: string;
  superficie: number;
  dormitorios?: number;
  nro_banos?: number;
  estadoOcupacion: 'Ocupada' | 'Vacante' | 'Mantenimiento';
  propietarios?: string;
  arrendatarios?: string;
  m2_utiles?: number;
  m2_terraza?: number;
}

export interface EstadisticasEdificio {
  totalTorres: number;
  totalUnidades: number;
  promedioUnidadesPorTorre: number;
  totalUnidadesOcupadas: number;
  totalUnidadesVacantes: number;
}

export interface EstadisticasPorPiso {
  piso: number;
  totalUnidades: number;
  unidadesOcupadas: number;
  superficieTotal: number;
  superficiePromedio: number;
}

// Listado completo de torres de un edificio
export const getTorresListado = async (edificioId: number): Promise<Torre[]> => {
  const response = await apiClient.get(`/torres/edificio/${edificioId}/listado`);
  return response.data;
};

// Buscar y filtrar torres
export const buscarTorres = async (
  edificioId: number,
  params?: {
    search?: string;
    sortBy?: 'nombre' | 'unidades' | 'fecha';
    sortOrder?: 'ASC' | 'DESC';
  },
): Promise<Torre[]> => {
  const response = await apiClient.get(`/torres/edificio/${edificioId}/buscar`, { params });
  return response.data;
};

// Estadísticas del edificio
export const getEstadisticasEdificio = async (
  edificioId: number,
): Promise<EstadisticasEdificio> => {
  const response = await apiClient.get(`/torres/edificio/${edificioId}/estadisticas`);
  return response.data;
};

// Detalle completo de una torre
export const getTorreDetalle = async (torreId: number): Promise<TorreDetalle> => {
  const response = await apiClient.get(`/torres/${torreId}/detalle`);
  return response.data;
};

// Listar unidades de una torre
export const getUnidadesTorre = async (torreId: number): Promise<Unidad[]> => {
  const response = await apiClient.get(`/torres/${torreId}/unidades`);
  return response.data;
};

// Unidades filtradas por estado
export const getUnidadesFiltradas = async (
  torreId: number,
  estado: 'todas' | 'ocupada' | 'vacante' = 'todas',
): Promise<Unidad[]> => {
  const response = await apiClient.get(`/torres/${torreId}/unidades/filtradas`, {
    params: { estado },
  });
  return response.data;
};

// Estadísticas por piso
export const getEstadisticasPorPiso = async (
  torreId: number,
): Promise<EstadisticasPorPiso[]> => {
  const response = await apiClient.get(`/torres/${torreId}/estadisticas-por-piso`);
  return response.data;
};

// Validar código de torre
export const validarCodigoTorre = async (
  edificioId: number,
  codigo: string,
): Promise<{ existe: boolean }> => {
  const response = await apiClient.get(`/torres/edificio/${edificioId}/validar-codigo`, {
    params: { codigo },
  });
  return response.data;
};

// Obtener siguiente código disponible
export const getSiguienteCodigo = async (
  edificioId: number,
): Promise<{ siguienteCodigo: string }> => {
  const response = await apiClient.get(`/torres/edificio/${edificioId}/siguiente-codigo`);
  return response.data;
};

// Verificar si se puede eliminar
export const puedeEliminarTorre = async (torreId: number): Promise<{
  puedeEliminar: boolean;
  razon?: string;
  totalUnidades: number;
  unidadesActivas: number;
}> => {
  const response = await apiClient.get(`/torres/${torreId}/puede-eliminar`);
  return response.data;
};

// Reporte completo
export const getReporteCompleto = async (params?: {
  edificioId?: number;
  comunidadId?: number;
}): Promise<Torre[]> => {
  const response = await apiClient.get('/torres/reportes/completo', { params });
  return response.data;
};

// Crear torre
export const crearTorre = async (data: Partial<Torre>): Promise<Torre> => {
  const response = await apiClient.post('/torres', data);
  return response.data;
};

// Actualizar torre
export const actualizarTorre = async (torreId: number, data: Partial<Torre>): Promise<Torre> => {
  const response = await apiClient.put(`/torres/${torreId}`, data);
  return response.data;
};

// Eliminar torre
export const eliminarTorre = async (torreId: number): Promise<void> => {
  await apiClient.delete(`/torres/${torreId}`);
};
