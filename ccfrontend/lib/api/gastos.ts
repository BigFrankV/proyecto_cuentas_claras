import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tipos
export interface Gasto {
  id: number;
  numero: string;
  comunidad_id: number;
  categoria_id: number;
  centro_costo_id?: number;
  documento_compra_id?: number;
  fecha: string;
  monto: number;
  glosa: string;
  extraordinario: boolean;
  estado: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado' | 'pagado' | 'anulado';
  creado_por: number;
  aprobado_por?: number;
  created_at: string;
  updated_at: string;
  categoria_nombre?: string;
  centro_costo_nombre?: string;
  creado_por_nombre?: string;
  aprobado_por_nombre?: string;
}

export interface GastoDetalle extends Gasto {
  aprobaciones?: Aprobacion[];
  historial?: HistorialCambio[];
}

export interface Aprobacion {
  id: number;
  gasto_id: number;
  persona_id: number;
  rol_id: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  comentario?: string;
  fecha_aprobacion?: string;
  created_at: string;
  persona_nombre?: string;
  rol_nombre?: string;
}

export interface HistorialCambio {
  id: number;
  gasto_id: number;
  usuario_id: number;
  tipo_cambio: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  created_at: string;
  usuario_nombre?: string;
  rol_nombre?: string;
}

export interface ArchivoAdjunto {
  id: number;
  gasto_id: number;
  nombre_archivo: string;
  ruta: string;
  tipo_archivo: string;
  tamano: number;
  subido_por: number;
  created_at: string;
  subido_por_nombre?: string;
}

export interface EmisionGasto {
  id: number;
  emision_id: number;
  gasto_id: number;
  monto_distribuido: number;
  periodo: string;
  anio: number;
  estado: string;
}

export interface EstadisticasGastos {
  total_gastos: number;
  monto_total: number;
  pendientes_aprobacion: number;
  gastos_aprobados: number;
  monto_promedio: number;
  gastos_mes_actual: number;
  monto_mes_actual: number;
}

export interface GastoPorCategoria {
  categoria_id: number;
  categoria_nombre: string;
  total_gastos: number;
  monto_total: number;
  porcentaje: number;
}

export interface GastoPorProveedor {
  proveedor_id: number;
  proveedor_nombre: string;
  total_gastos: number;
  monto_total: number;
  monto_promedio: number;
  ultimo_gasto: string;
}

export interface GastoPorCentroCosto {
  centro_costo_id: number;
  centro_costo_nombre: string;
  total_gastos: number;
  monto_total: number;
}

export interface EvolucionTemporal {
  mes: string;
  anio: number;
  total_gastos: number;
  monto_total: number;
  monto_promedio: number;
}

export interface Alerta {
  tipo: string;
  cantidad: number;
  descripcion: string;
}

export interface FiltrosGastos {
  page?: number;
  limit?: number;
  estado?: string;
  categoria?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  ordenar?: string;
  direccion?: 'ASC' | 'DESC';
}

export interface CrearGastoData {
  categoria_id: number;
  fecha: string;
  monto: number;
  glosa: string;
  centro_costo_id?: number;
  proveedor_id?: number;
  documento_compra_id?: number;
  extraordinario?: boolean;
}

export interface ActualizarGastoData {
  categoria_id?: number;
  fecha?: string;
  monto?: number;
  glosa?: string;
  centro_costo_id?: number;
  extraordinario?: boolean;
}

// Configurar axios con token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};

// API Functions

/**
 * Listar gastos con filtros y paginación
 */
export const listarGastos = async (comunidadId: number, filtros?: FiltrosGastos) => {
  const params = new URLSearchParams();
  if (filtros?.page) params.append('page', filtros.page.toString());
  if (filtros?.limit) params.append('limit', filtros.limit.toString());
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.categoria) params.append('categoria', filtros.categoria.toString());
  if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
  if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
  if (filtros?.busqueda) params.append('busqueda', filtros.busqueda);
  if (filtros?.ordenar) params.append('ordenar', filtros.ordenar);
  if (filtros?.direccion) params.append('direccion', filtros.direccion);

  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener detalle de un gasto
 */
export const obtenerGasto = async (id: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Crear nuevo gasto
 */
export const crearGasto = async (comunidadId: number, data: CrearGastoData) => {
  const response = await axios.post(
    `${API_URL}/gastos/comunidad/${comunidadId}`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Actualizar gasto
 */
export const actualizarGasto = async (id: number, data: ActualizarGastoData) => {
  const response = await axios.put(
    `${API_URL}/gastos/${id}`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Eliminar gasto (solo borradores)
 */
export const eliminarGasto = async (id: number) => {
  const response = await axios.delete(
    `${API_URL}/gastos/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener estadísticas de gastos
 */
export const obtenerEstadisticas = async (comunidadId: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/stats`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener gastos por categoría
 */
export const obtenerGastosPorCategoria = async (comunidadId: number, fechaDesde?: string, fechaHasta?: string) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);

  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/por-categoria?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener gastos por proveedor
 */
export const obtenerGastosPorProveedor = async (comunidadId: number, fechaDesde?: string, fechaHasta?: string) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);

  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/por-proveedor?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener gastos por centro de costo
 */
export const obtenerGastosPorCentroCosto = async (comunidadId: number, fechaDesde?: string, fechaHasta?: string) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);

  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/por-centro-costo?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener evolución temporal de gastos
 */
export const obtenerEvolucionTemporal = async (comunidadId: number, meses: number = 12) => {
  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/evolucion-temporal?meses=${meses}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener top gastos mayores
 */
export const obtenerTopGastos = async (comunidadId: number, limit: number = 10, fechaDesde?: string, fechaHasta?: string) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);

  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/top-gastos?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener gastos pendientes de aprobación
 */
export const obtenerGastosPendientes = async (comunidadId: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/pendientes-aprobacion`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener alertas de gastos
 */
export const obtenerAlertas = async (comunidadId: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/comunidad/${comunidadId}/alertas`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener historial de cambios de un gasto
 */
export const obtenerHistorial = async (id: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/${id}/historial`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener historial de aprobaciones
 */
export const obtenerAprobaciones = async (id: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/${id}/aprobaciones`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener archivos adjuntos
 */
export const obtenerArchivos = async (id: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/${id}/archivos`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Obtener emisiones relacionadas
 */
export const obtenerEmisiones = async (id: number) => {
  const response = await axios.get(
    `${API_URL}/gastos/${id}/emisiones`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Registrar aprobación o rechazo
 */
export const registrarAprobacion = async (id: number, estado: 'aprobado' | 'rechazado', comentario?: string) => {
  const response = await axios.post(
    `${API_URL}/gastos/${id}/aprobaciones`,
    { estado, comentario },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Anular gasto
 */
export const anularGasto = async (id: number, motivo: string) => {
  const response = await axios.post(
    `${API_URL}/gastos/${id}/anular`,
    { motivo },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Subir archivo adjunto
 */
export const subirArchivo = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append('archivo', file);

  const response = await axios.post(
    `${API_URL}/gastos/${id}/archivos`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

/**
 * Eliminar archivo adjunto
 */
export const eliminarArchivo = async (gastoId: number, archivoId: number) => {
  const response = await axios.delete(
    `${API_URL}/gastos/${gastoId}/archivos/${archivoId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
