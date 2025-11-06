import apiClient from './api';

/**
 * RECIBOS SERVICE
 * Gestión de recibos de pago
 */

export interface Recibo {
  id: number;
  numero_recibo: string;
  comunidad_id: number;
  comunidad?: string;
  pago_id: number;
  monto_pago?: number;
  monto_recibido: number;
  estado: 'pendiente_validacion' | 'validado' | 'rechazado';
  metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'deposito' | 'otro';
  fecha_recepcion: string;
  referencia?: string;
  observaciones?: string;
  recibido_por?: string;
  correo_recibidor?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtener listado de recibos con filtros
 */
export async function listRecibos(filters: any = {}, token?: string) {
  const response = await apiClient.get('/recibos', {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Obtener detalle de un recibo
 */
export async function getRecibo(id: number, token?: string) {
  const response = await apiClient.get(`/recibos/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data.data;
}

/**
 * Crear nuevo recibo
 */
export async function createRecibo(payload: any, token?: string) {
  const response = await apiClient.post('/recibos', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Actualizar recibo (validación, referencias, observaciones)
 */
export async function updateRecibo(
  id: number,
  payload: Partial<Recibo>,
  token?: string,
) {
  const response = await apiClient.put(`/recibos/${id}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Eliminar recibo (soft delete)
 */
export async function deleteRecibo(id: number, token?: string) {
  const response = await apiClient.delete(`/recibos/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Validar recibo (cambiar estado a validado)
 */
export async function validarRecibo(id: number, token?: string) {
  return updateRecibo(id, { estado: 'validado' }, token);
}

/**
 * Rechazar recibo (cambiar estado a rechazado)
 */
export async function rechazarRecibo(
  id: number,
  motivo: string,
  token?: string,
) {
  return updateRecibo(id, { estado: 'rechazado', observaciones: motivo }, token);
}

const reciboService = {
  listRecibos,
  getRecibo,
  createRecibo,
  updateRecibo,
  deleteRecibo,
  validarRecibo,
  rechazarRecibo,
};

export default reciboService;
