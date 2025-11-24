import apiClient from './api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CargoAPI {
  id: number;
  concepto: string;
  descripcion?: string;
  tipo: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'parcial';
  monto_total?: number;
  monto?: number;
  fecha_vencimiento?: string;
  fecha?: string;
  unidad?: string;
  codigo?: string;
  nombre_comunidad?: string;
  periodo?: string;
  propietario?: string;
  saldo?: number;
  interes_acumulado?: number;
  fecha_creacion?: string;
  created_at?: string;
  email_propietario?: string;
  telefono_propietario?: string;
}

export interface Cargo {
  id: number;
  concepto: string;
  descripcion?: string;
  tipo: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'parcial';
  monto: number;
  fechaVencimiento: Date;
  unidad: string;
  nombreComunidad?: string;
  periodo?: string;
  propietario?: string;
  saldo: number;
  interesAcumulado: number;
  fechaCreacion: Date;
  emailPropietario?: string;
  telefonoPropietario?: string;
}

export interface CargoFormData {
  concept?: string;
  concepto?: string;
  type?: string;
  tipo?: string;
  amount?: number;
  monto?: number;
  dueDate?: string;
  fecha_vencimiento?: string;
  unit?: string;
  unidad?: string;
  description?: string;
  descripcion?: string;
  periodo?: string;
}

export interface CargoStats {
  total_cargos: number;
  monto_total?: number;
  total_monto?: number;
  saldo_total?: number;
  total_saldo?: number;
  interes_total?: number;
  total_interes?: number;
  cargos_pagados: number;
  cargos_pendientes: number;
  cargos_vencidos?: number;
  cargos_parciales?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

const mapCargoFromAPI = (data: CargoAPI): Cargo => ({
  id: data.id,
  concepto: data.concepto || '',
  descripcion: data.descripcion,
  tipo: data.tipo || '',
  estado: data.estado || 'pendiente',
  monto: data.monto_total ?? data.monto ?? 0,
  fechaVencimiento: new Date(
    data.fecha_vencimiento || data.fecha || data.created_at || new Date(),
  ),
  unidad: data.unidad || data.codigo || '',
  nombreComunidad: data.nombre_comunidad,
  periodo: data.periodo,
  propietario: data.propietario,
  saldo: data.saldo ?? 0,
  interesAcumulado: data.interes_acumulado ?? 0,
  fechaCreacion: new Date(
    data.fecha_creacion || data.created_at || new Date(),
  ),
  emailPropietario: data.email_propietario,
  telefonoPropietario: data.telefono_propietario,
});

// ============================================================================
// API CALLS - USING CORRECT BACKEND ENDPOINTS
// ============================================================================

/**
 * Listar todos los cargos
 */
export async function listCargos(filters?: any): Promise<Cargo[]> {
  try {
    const response = await apiClient.get('/cargos', { params: filters });
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Obtener un cargo por ID
 */
export async function getCargo(id: number): Promise<Cargo | null> {
  try {
    const response = await apiClient.get(`/cargos/${id}`);
    return mapCargoFromAPI(response.data);
  } catch {
    return null;
  }
}

/**
 * Obtener cargos por comunidad con paginación
 */
export async function listCargosByComunidad(
  comunidadId: number,
  filters?: any,
  page: number = 1,
  limit: number = 100,
): Promise<{ data: Cargo[]; pagination?: any }> {
  try {
    const params = { ...filters, page, limit };
    const response = await apiClient.get(`/cargos/comunidad/${comunidadId}`, {
      params,
    });
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return {
      data: data.map(mapCargoFromAPI),
      pagination: response.data?.pagination,
    };
  } catch {
    return { data: [], pagination: undefined };
  }
}

/**
 * Obtener historial de cargos de una unidad
 */
export async function getCargoHistoricalByUnidad(unidadId: number): Promise<Cargo[]> {
  try {
    const response = await apiClient.get(`/cargos/unidad/${unidadId}`);
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Obtener cargos de una unidad específica
 */
export async function getCargosByUnidad(unidadId: number): Promise<Cargo[]> {
  try {
    const response = await apiClient.get(`/cargos/unidad/${unidadId}`);
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Obtener cargos por comunidad
 */
export async function getCargosByComunidad(
  comunidadId: number,
  filters?: any,
): Promise<Cargo[]> {
  try {
    const params = { ...filters };
    const response = await apiClient.get(`/cargos/comunidad/${comunidadId}`, {
      params,
    });
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Obtener resumen de TODOS los cargos (solo superadmin)
 */
export async function getTodosCargosResumen(): Promise<Cargo[]> {
  try {
    const response = await apiClient.get('/cargos/todas/resumen');
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Obtener resumen de cargos de una comunidad
 * - Superadmin: ve todos los cargos de la comunidad
 * - Admin/Tesorero/Presidente: ve todos los cargos de su comunidad
 * - Propietario/Inquilino/Residente: ve solo los cargos de sus unidades
 */
export async function getCargosResumenByComunidad(
  comunidadId: number,
): Promise<Cargo[]> {
  try {
    const response = await apiClient.get(`/cargos/comunidad/${comunidadId}/resumen`);
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Obtener detalle de gastos que componen un cargo
 */
export async function getCargoDetalle(cargoId: number): Promise<any[]> {
  try {
    const response = await apiClient.get(`/cargos/${cargoId}/detalle`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

/**
 * Obtener pagos aplicados a un cargo
 */
export async function getCargoPagos(cargoId: number): Promise<any[]> {
  try {
    const response = await apiClient.get(`/cargos/${cargoId}/pagos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

/**
 * Obtener estadísticas de cargos por comunidad
 */
export async function getCargoStatsByComunidad(comunidadId: number): Promise<CargoStats> {
  try {
    const response = await apiClient.get(`/cargos/comunidad/${comunidadId}/estadisticas`);
    return {
      total_cargos: response.data?.total_cargos ?? 0,
      total_monto: response.data?.monto_total ?? response.data?.total_monto ?? 0,
      saldo_total: response.data?.saldo_total ?? 0,
      total_saldo: response.data?.saldo_total ?? 0,
      total_interes: response.data?.interes_total ?? response.data?.total_interes ?? 0,
      cargos_pagados: response.data?.cargos_pagados ?? 0,
      cargos_pendientes: response.data?.cargos_pendientes ?? 0,
      cargos_vencidos: response.data?.cargos_vencidos ?? 0,
      cargos_parciales: response.data?.cargos_parciales ?? 0,
    };
  } catch {
    return {
      total_cargos: 0,
      total_monto: 0,
      saldo_total: 0,
      total_saldo: 0,
      total_interes: 0,
      cargos_pagados: 0,
      cargos_pendientes: 0,
      cargos_vencidos: 0,
      cargos_parciales: 0,
    };
  }
}

/**
 * Obtener resumen de cargos por unidad
 */
export async function getCargoResumenByUnidad(unidadId: number): Promise<any> {
  try {
    const response = await apiClient.get(`/cargos/unidad/${unidadId}/resumen`);
    return response.data;
  } catch {
    return {};
  }
}

/**
 * Obtener análisis de morosidad
 */
export async function getCargoMorosidad(comunidadId?: number): Promise<any> {
  try {
    const params = comunidadId ? { comunidad_id: comunidadId } : {};
    const response = await apiClient.get('/cargos/analytics/morosidad', { params });
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Obtener tendencias de cargos por período
 */
export async function getCargoPeriodTrends(comunidadId?: number): Promise<any> {
  try {
    const params = comunidadId ? { comunidad_id: comunidadId } : {};
    const response = await apiClient.get('/cargos/analytics/tendencias', { params });
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Obtener distribución de cargos por tipo
 */
export async function getCargoTypeDistribution(comunidadId?: number): Promise<any> {
  try {
    const params = comunidadId ? { comunidad_id: comunidadId } : {};
    const response = await apiClient.get('/cargos/analytics/por-tipo', { params });
    return response.data;
  } catch {
    return [];
  }
}

/**
 * Obtener historial de pagos de un cargo
 */
export async function getCargoHistorialPagos(cargoId: number): Promise<any[]> {
  try {
    const response = await apiClient.get(`/cargos/${cargoId}/historial-pagos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

/**
 * Obtener cargos que requieren acción
 */
export async function getCargosAlerta(comunidadId?: number): Promise<Cargo[]> {
  try {
    const params = comunidadId ? { comunidad_id: comunidadId } : {};
    const response = await apiClient.get('/cargos/alertas/proximos-vencimiento', {
      params,
    });
    const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return data.map(mapCargoFromAPI);
  } catch {
    return [];
  }
}

/**
 * Proyectar ingresos por período
 */
export async function proyectarIngresosCargos(comunidadId?: number): Promise<any> {
  try {
    const params = comunidadId ? { comunidad_id: comunidadId } : {};
    const response = await apiClient.get('/cargos/proyecciones/ingresos', {
      params,
    });
    return response.data;
  } catch {
    return {};
  }
}

/**
 * Recalcular interés de un cargo vencido
 */
export async function recalcularInteresCargoVencido(
  cargoId: number,
  tasaInteres?: number,
): Promise<any> {
  try {
    const response = await apiClient.post(`/cargos/${cargoId}/recalcular-interes`, {
      tasa_interes: tasaInteres,
    });
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Enviar notificación para un cargo
 */
export async function notificarCargo(cargoId: number): Promise<any> {
  try {
    const response = await apiClient.post(`/cargos/${cargoId}/notificar`);
    return response.data;
  } catch {
    return null;
  }
}

/**
 * Crear un nuevo cargo
 */
export async function createCargo(payload: CargoFormData): Promise<Cargo | null> {
  try {
    // Normalizar el payload para que coincida con lo que espera el backend
    const normalizedPayload = {
      concept: payload.concepto || payload.concept,
      type: payload.tipo || payload.type,
      amount: payload.monto ?? payload.amount,
      dueDate: payload.fecha_vencimiento || payload.dueDate,
      unit: payload.unidad || payload.unit,
      description: payload.descripcion || payload.description,
      periodo: payload.periodo,
    };

    const response = await apiClient.post('/cargos', normalizedPayload);
    return mapCargoFromAPI(response.data);
  } catch {
    return null;
  }
}

/**
 * Actualizar un cargo (PATCH)
 */
export async function updateCargo(
  id: number,
  payload: Partial<CargoFormData>,
): Promise<Cargo | null> {
  try {
    const response = await apiClient.patch(`/cargos/${id}`, payload);
    return mapCargoFromAPI(response.data);
  } catch {
    return null;
  }
}

/**
 * Actualizar cargo (PUT)
 */
export async function updateCargoFull(
  id: number,
  payload: any,
): Promise<Cargo | null> {
  try {
    const response = await apiClient.put(`/cargos/${id}`, payload);
    return mapCargoFromAPI(response.data);
  } catch {
    return null;
  }
}

/**
 * Eliminar un cargo
 */
export async function deleteCargo(id: number): Promise<boolean> {
  try {
    await apiClient.delete(`/cargos/${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtener estadísticas de cargos (calculadas localmente)
 */
export async function getCargoStats(): Promise<CargoStats> {
  try {
    const allCargos = await listCargos();

    return {
      total_cargos: allCargos.length,
      total_monto: allCargos.reduce((sum, c) => sum + c.monto, 0),
      saldo_total: allCargos.reduce((sum, c) => sum + c.saldo, 0),
      total_saldo: allCargos.reduce((sum, c) => sum + c.saldo, 0),
      total_interes: allCargos.reduce((sum, c) => sum + c.interesAcumulado, 0),
      cargos_pagados: allCargos.filter(c => c.estado === 'pagado').length,
      cargos_pendientes: allCargos.filter(c => c.estado === 'pendiente').length,
      cargos_vencidos: allCargos.filter(c => c.estado === 'vencido').length,
      cargos_parciales: allCargos.filter(c => c.estado === 'parcial').length,
    };
  } catch {
    return {
      total_cargos: 0,
      total_monto: 0,
      saldo_total: 0,
      total_saldo: 0,
      total_interes: 0,
      cargos_pagados: 0,
      cargos_pendientes: 0,
      cargos_vencidos: 0,
      cargos_parciales: 0,
    };
  }
}

/**
 * Obtener cargos vencidos
 */
export async function getCargosVencidos(): Promise<Cargo[]> {
  try {
    const allCargos = await listCargos();
    const today = new Date();

    return allCargos.filter(cargo => {
      return cargo.estado === 'pendiente' && cargo.fechaVencimiento < today;
    });
  } catch {
    return [];
  }
}

