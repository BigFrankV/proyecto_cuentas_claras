import apiClient from './api';

// Interfaces para los datos del dashboard
export interface KPIMetric {
  valor: number;
  variacion_porcentual?: number;
  periodo_actual?: string;
  periodo_anterior?: string;
}

export interface DashboardKPIs {
  saldo_total: KPIMetric;
  ingresos_mes: KPIMetric;
  gastos_mes: KPIMetric;
  morosidad: KPIMetric;
}

export interface ChartDataPoint {
  periodo?: string;
  anio?: number;
  mes?: number;
  monto_total_emisiones?: number;
  cantidad_unidades?: number;
  monto_promedio_por_unidad?: number;
  categoria_pago?: string;
  porcentaje?: number;
  monto_total_pendiente?: number;
}

export interface PagoReciente {
  id: number;
  fecha: string;
  monto: number;
  unidad_codigo: string;
  propietario: string;
  metodo_pago: string;
  estado: string;
}

export interface UnidadMorosa {
  unidad_id: number;
  codigo_unidad: string;
  propietario: string;
  meses_morosos: number;
  deuda_total: number;
  dias_maximo_atraso: number;
  deuda_promedio: number;
  periodos_pendientes: string;
}

export interface ActividadProxima {
  tipo_actividad: string;
  titulo: string;
  descripcion: string;
  fecha_programada: string;
  fecha_formateada: string;
  estado: string;
  estado_relativo: string;
  dias_restantes: number;
}

export interface ReservaAmenidad {
  id: number;
  amenidad: string;
  tarifa: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  unidad_reserva: string;
  reservado_por: string;
  horas_reserva: number;
  dias_para_reserva: number;
  estado_descripcion: string;
}

export interface Notificacion {
  tipo_notificacion: string;
  titulo: string;
  mensaje: string;
  fecha_notificacion: string;
  referencia_id: number;
  severidad: string;
}

export interface ConsumoMedidor {
  medidor: string;
  consumo: number;
  periodo: string;
  unidad: string;
}

export interface EstadoPago {
  tipo: string;
  cantidad: number;
  color: string;
  porcentaje?: number;
}

export interface GastoPorCategoria {
  categoria: string;
  total: number;
  color: string;
}

export interface TendenciaEmision {
  fecha: string;
  monto: number;
  cantidad: number;
}

// Funciones para obtener datos del dashboard

/**
 * Obtiene todos los KPIs principales del dashboard
 */
export async function getDashboardKPIs(comunidadId: number): Promise<DashboardKPIs> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/kpis`);
  return response.data;
}

/**
 * Obtiene datos para el gráfico de tendencia de emisiones
 */
export async function getGraficoEmisiones(comunidadId: number, meses: number = 6): Promise<TendenciaEmision[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/grafico-emisiones`, {
    params: { meses }
  });
  return response.data;
}

/**
 * Obtiene datos para el gráfico de estado de pagos
 */
export async function getGraficoEstadoPagos(comunidadId: number): Promise<EstadoPago[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/grafico-estado-pagos`);
  return response.data;
}

/**
 * Obtiene datos para el gráfico de gastos por categoría
 */
export async function getGraficoGastosPorCategoria(comunidadId: number): Promise<GastoPorCategoria[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/grafico-gastos-categoria`);
  return response.data;
}

/**
 * Obtiene pagos recientes
 */
export async function getPagosRecientes(comunidadId: number, limit: number = 5): Promise<PagoReciente[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/pagos-recientes`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Obtiene unidades con morosidad
 */
export async function getUnidadesMorosas(comunidadId: number, limit: number = 5): Promise<UnidadMorosa[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/unidades-morosas`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Obtiene próximas actividades
 */
export async function getProximasActividades(comunidadId: number, limit: number = 4): Promise<ActividadProxima[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/proximas-actividades`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Obtiene reservas de amenidades próximas
 */
export async function getReservasAmenidades(comunidadId: number, limit: number = 3): Promise<ReservaAmenidad[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/reservas-amenidades`, {
    params: { limit }
  });
  return response.data;
}

/**
 * Obtiene notificaciones recientes
 */
export async function getNotificacionesRecientes(comunidadId: number, limit: number = 3): Promise<Notificacion[]> {
  const response = await apiClient.get(`/dashboard/comunidad/${comunidadId}/notificaciones`, {
    params: { limit }
  });
  return response.data;
}
