import apiClient from './api';

/**
 * BITACORA SERVICE
 * Gestión de registros de auditoría
 */

export interface BitacoraAuditoria {
  id: number;
  numero_registro: string;
  comunidad_id: number;
  tipo: 'acceso' | 'cambio_datos' | 'accion_importante' | 'evento_seguridad' | 'otro';
  prioridad: 'baja' | 'media' | 'alta' | 'crítica';
  titulo: string;
  descripcion: string;
  fecha: string;
  usuario_id: number;
  usuario?: string;
  email?: string;
  tags?: string;
  adjuntos?: string;
  activo: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtener listado de registros de auditoría
 */
export async function listBitacora(filters: any = {}, token?: string) {
  const response = await apiClient.get('/bitacora', {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Obtener detalle de un registro
 */
export async function getBitacora(id: number, token?: string) {
  const response = await apiClient.get(`/bitacora/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data.data;
}

/**
 * Crear nuevo registro de auditoría
 */
export async function createBitacora(payload: any, token?: string) {
  const response = await apiClient.post('/bitacora', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Actualizar registro de auditoría
 */
export async function updateBitacora(
  id: number,
  payload: Partial<BitacoraAuditoria>,
  token?: string,
) {
  const response = await apiClient.put(`/bitacora/${id}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Eliminar registro de auditoría (soft delete)
 */
export async function deleteBitacora(id: number, token?: string) {
  const response = await apiClient.delete(`/bitacora/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Filtrar por prioridad
 */
export async function getBitacoraByPrioridad(
  prioridad: string,
  filters: any = {},
  token?: string,
) {
  return listBitacora({ ...filters, prioridad }, token);
}

/**
 * Filtrar por tipo de evento
 */
export async function getBitacoraByTipo(
  tipo: string,
  filters: any = {},
  token?: string,
) {
  return listBitacora({ ...filters, tipo }, token);
}

const bitacoraService = {
  listBitacora,
  getBitacora,
  createBitacora,
  updateBitacora,
  deleteBitacora,
  getBitacoraByPrioridad,
  getBitacoraByTipo,
};

export default bitacoraService;
