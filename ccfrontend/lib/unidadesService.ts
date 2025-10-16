import apiClient from './api';

// ============= INTERFACES =============

export interface Unidad {
  id: number;
  codigo: string;
  comunidad_id: number;
  edificio_id?: number;
  torre_id?: number;
  edificio_nombre?: string;
  torre_nombre?: string;
  comunidad_nombre?: string;
  tipo?: string;
  piso?: number;
  dormitorios?: number;
  nro_banos?: number;
  descripcion?: string;
  m2_utiles?: number;
  m2_terraza?: number;
  superficie?: number;
  alicuota?: number;
  nro_estacionamiento?: string;
  nro_bodega?: string;
  activa?: boolean;
  propietarios?: string;
  arrendatarios?: string;
  saldo_pendiente?: number;
  ultimo_pago_fecha?: string;
  ultimo_pago_monto?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UnidadSummary extends Unidad {
  total_cuentas_pendientes?: number;
  total_pagos?: number;
  consumo_agua_mes?: number;
  consumo_luz_mes?: number;
  multas_activas?: number;
  reservas_pendientes?: number;
}

export interface CuentaCobro {
  id: number;
  unidad_id: number;
  periodo: string;
  concepto?: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto: number;
  total?: number;
  saldo?: number;
  estado: string;
  descripcion?: string;
}

export interface DetalleCuenta {
  id: number;
  cuenta_cobro_id: number;
  tipo: string;
  concepto: string;
  monto: number;
  descripcion?: string;
}

export interface Pago {
  id: number;
  unidad_id: number;
  fecha_pago: string;
  monto: number;
  medio_pago: string;
  referencia?: string;
  estado: string;
  comprobante?: string;
}

export interface Tenencia {
  id: number;
  unidad_id: number;
  persona_id: number;
  tipo: 'propietario' | 'arrendatario' | 'usufructuario';
  desde: string;
  hasta?: string;
  porcentaje?: number;
  nombres?: string;
  apellidos?: string;
  email?: string;
  rut?: string;
  dv?: string;
}

export interface Residente {
  id: number;
  rut?: string;
  dv?: string;
  nombres: string;
  apellidos: string;
  tipo: string;
  desde: string;
  hasta?: string;
  porcentaje?: number;
}

export interface Medidor {
  id: number;
  unidad_id: number;
  tipo: string;
  numero: string;
  ubicacion?: string;
  ultima_lectura?: number;
  fecha_ultima_lectura?: string;
  consumo_promedio?: number;
}

export interface LecturaMedidor {
  id: number;
  medidor_id: number;
  fecha: string;
  lectura_anterior: number;
  lectura_actual: number;
  consumo: number;
  periodo: string;
}

export interface Multa {
  id: number;
  unidad_id: number;
  fecha: string;
  concepto: string;
  monto: number;
  estado: string;
  descripcion?: string;
}

export interface Reserva {
  id: number;
  unidad_id: number;
  amenidad: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface Ticket {
  id: number;
  unidad_id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
}

export interface DropdownOption {
  id: number;
  nombre: string;
}

// ============= API CALLS =============

/**
 * Listado principal de unidades con filtros
 */
export async function getUnidadesListado(params?: {
  comunidad_id?: number;
  edificio_id?: number;
  torre_id?: number;
  search?: string;
  activa?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Unidad[]> {
  const response = await apiClient.get('/unidades', { params });
  return response.data;
}

/**
 * Obtener detalle básico de una unidad
 */
export async function getUnidadDetalle(id: number): Promise<Unidad> {
  const response = await apiClient.get(`/unidades/${id}`);
  return response.data;
}

/**
 * Obtener resumen completo de una unidad (con más información)
 */
export async function getUnidadSummary(id: number): Promise<UnidadSummary> {
  const response = await apiClient.get(`/unidades/${id}/summary`);
  return response.data;
}

/**
 * Crear nueva unidad en una comunidad
 */
export async function crearUnidad(
  comunidadId: number,
  data: {
    codigo: string;
    edificio_id?: number;
    torre_id?: number;
    tipo?: string;
    piso?: number;
    dormitorios?: number;
    nro_banos?: number;
    descripcion?: string;
    m2_utiles?: number;
    m2_terraza?: number;
    alicuota?: number;
    nro_estacionamiento?: string;
    nro_bodega?: string;
    activa?: boolean;
  },
): Promise<Unidad> {
  const response = await apiClient.post(`/unidades/comunidad/${comunidadId}`, data);
  return response.data;
}

/**
 * Actualizar unidad
 */
export async function actualizarUnidad(
  id: number,
  data: Partial<Unidad>,
): Promise<Unidad> {
  const response = await apiClient.patch(`/unidades/${id}`, data);
  return response.data;
}

/**
 * Eliminar unidad
 */
export async function eliminarUnidad(id: number): Promise<void> {
  await apiClient.delete(`/unidades/${id}`);
}

/**
 * Listar unidades por comunidad (endpoint simplificado)
 */
export async function getUnidadesPorComunidad(
  comunidadId: number,
): Promise<Unidad[]> {
  const response = await apiClient.get(`/unidades/comunidad/${comunidadId}`);
  return response.data;
}

// ============= CUENTAS DE COBRO =============

/**
 * Obtener cuentas de cobro de una unidad
 */
export async function getCuentasCobroUnidad(unidadId: number): Promise<CuentaCobro[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/cuentas`);
  return response.data;
}

/**
 * Obtener cuentas de cobro con detalle completo
 */
export async function getCuentasFullUnidad(unidadId: number): Promise<any[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/cuentas_full`);
  return response.data;
}

/**
 * Obtener detalle de una cuenta de cobro (partidas)
 */
export async function getDetalleCuentaCobro(
  cuentaId: number,
): Promise<DetalleCuenta[]> {
  const response = await apiClient.get(`/unidades/cuentas/${cuentaId}/detalle`);
  return response.data;
}

/**
 * Obtener aplicaciones de pagos a una cuenta
 */
export async function getAplicacionesCuenta(cuentaId: number): Promise<any[]> {
  const response = await apiClient.get(`/unidades/cuentas/${cuentaId}/aplicaciones`);
  return response.data;
}

// ============= PAGOS =============

/**
 * Obtener pagos de una unidad
 */
export async function getPagosUnidad(unidadId: number): Promise<Pago[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/pagos`);
  return response.data;
}

// ============= TENENCIAS Y RESIDENTES =============

/**
 * Obtener tenencias (propietarios/arrendatarios) de una unidad
 */
export async function getTenenciasUnidad(
  unidadId: number,
  activo?: boolean,
): Promise<Tenencia[]> {
  const params = activo ? { activo: '1' } : {};
  const response = await apiClient.get(`/unidades/${unidadId}/tenencias`, { params });
  return response.data;
}

/**
 * Crear nueva tenencia
 */
export async function crearTenencia(
  unidadId: number,
  data: {
    persona_id: number;
    tipo: string;
    desde: string;
    hasta?: string;
    porcentaje?: number;
  },
): Promise<Tenencia> {
  const response = await apiClient.post(`/unidades/${unidadId}/tenencias`, data);
  return response.data;
}

/**
 * Obtener residentes activos de una unidad
 */
export async function getResidentesUnidad(unidadId: number): Promise<Residente[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/residentes`);
  return response.data;
}

// ============= MEDIDORES Y LECTURAS =============

/**
 * Obtener medidores de una unidad con última lectura
 */
export async function getMedidoresUnidad(unidadId: number): Promise<Medidor[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/medidores`);
  return response.data;
}

/**
 * Obtener lecturas de un medidor
 */
export async function getLecturasMedidor(
  medidorId: number,
): Promise<LecturaMedidor[]> {
  const response = await apiClient.get(`/unidades/medidores/${medidorId}/lecturas`);
  return response.data;
}

// ============= MULTAS =============

/**
 * Obtener multas de una unidad
 */
export async function getMultasUnidad(unidadId: number): Promise<Multa[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/multas`);
  return response.data;
}

// ============= RESERVAS =============

/**
 * Obtener reservas de una unidad
 */
export async function getReservasUnidad(unidadId: number): Promise<Reserva[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/reservas`);
  return response.data;
}

// ============= TICKETS =============

/**
 * Obtener tickets de soporte de una unidad
 */
export async function getTicketsUnidad(unidadId: number): Promise<Ticket[]> {
  const response = await apiClient.get(`/unidades/${unidadId}/tickets`);
  return response.data;
}

// ============= VISTA FINANCIERA =============

/**
 * Obtener vista financiera de una unidad
 */
export async function getVistaFinancieraUnidad(unidadId: number): Promise<any> {
  const response = await apiClient.get(`/unidades/${unidadId}/financiero`);
  return response.data;
}

// ============= DROPDOWNS =============

/**
 * Obtener lista de comunidades para dropdown
 */
export async function getComunidadesDropdown(): Promise<DropdownOption[]> {
  const response = await apiClient.get('/unidades/dropdowns/comunidades');
  return response.data;
}

/**
 * Obtener lista de edificios para dropdown
 */
export async function getEdificiosDropdown(
  comunidadId?: number,
): Promise<DropdownOption[]> {
  const params = comunidadId ? { comunidad_id: comunidadId } : {};
  const response = await apiClient.get('/unidades/dropdowns/edificios', { params });
  return response.data;
}

/**
 * Obtener lista de torres para dropdown
 */
export async function getTorresDropdown(edificioId?: number): Promise<DropdownOption[]> {
  const params = edificioId ? { edificio_id: edificioId } : {};
  const response = await apiClient.get('/unidades/dropdowns/torres', { params });
  return response.data;
}

/**
 * Obtener lista de personas para dropdown
 */
export async function getPersonasDropdown(
  comunidadId?: number,
): Promise<DropdownOption[]> {
  const params = comunidadId ? { comunidad_id: comunidadId } : {};
  const response = await apiClient.get('/unidades/dropdowns/personas', { params });
  return response.data;
}
