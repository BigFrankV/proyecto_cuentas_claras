import apiClient from './api';

/**
 * RESERVAS SERVICE
 * Gestión de reservas de amenidades
 */

export interface Reserva {
  id: number;
  numero_reserva: string;
  comunidad_id: number;
  comunidad?: string;
  amenidad_id: number;
  amenidad?: string;
  usuario_id: number;
  usuario?: string;
  email?: string;
  unidad_id: number;
  numero_unidad?: string;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_personas: number;
  estado: 'solicitada' | 'aprobada' | 'rechazada' | 'cumplida' | 'cancelada';
  motivo_rechazo?: string;
  observaciones?: string;
  aprobado_por?: number;
  fecha_aprobacion?: string;
  reglas?: string;
  capacidad?: number;
  requiere_aprobacion?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtener listado de reservas con filtros
 */
export async function listReservas(filters: any = {}, token?: string) {
  const response = await apiClient.get('/reservas', {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Obtener detalle de una reserva
 */
export async function getReserva(id: number, token?: string) {
  const response = await apiClient.get(`/reservas/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data.data;
}

/**
 * Crear nueva reserva de amenidad
 */
export async function createReserva(payload: any, token?: string) {
  const response = await apiClient.post('/reservas', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Actualizar reserva (fechas, cantidad, estado)
 */
export async function updateReserva(
  id: number,
  payload: Partial<Reserva>,
  token?: string,
) {
  const response = await apiClient.put(`/reservas/${id}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Cancelar reserva (soft delete)
 */
export async function cancelarReserva(id: number, token?: string) {
  const response = await apiClient.delete(`/reservas/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Aprobar reserva (solo admin)
 */
export async function aprobarReserva(id: number, token?: string) {
  return updateReserva(id, { estado: 'aprobada' }, token);
}

/**
 * Rechazar reserva (solo admin)
 */
export async function rechazarReserva(
  id: number,
  motivo: string,
  token?: string,
) {
  return updateReserva(
    id,
    { estado: 'rechazada', motivo_rechazo: motivo },
    token,
  );
}

/**
 * Marcar como completada (solo admin)
 */
export async function marcarCompletada(id: number, token?: string) {
  return updateReserva(id, { estado: 'cumplida' }, token);
}

const reservasService = {
  listReservas,
  getReserva,
  createReserva,
  updateReserva,
  cancelarReserva,
  aprobarReserva,
  rechazarReserva,
  marcarCompletada,
};

export default reservasService;
