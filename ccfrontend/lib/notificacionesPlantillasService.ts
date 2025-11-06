import apiClient from './api';

/**
 * NOTIFICACIONES PLANTILLAS SERVICE
 * Gestión de plantillas de notificaciones
 */

export interface NotificacionPlantilla {
  id: number;
  comunidad_id: number;
  nombre: string;
  tipo: 'email' | 'sms' | 'push' | 'ambos';
  asunto: string;
  contenido: string;
  variables?: string;
  estado: 'activa' | 'inactiva' | 'prueba';
  activo: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtener listado de plantillas con filtros
 */
export async function listNotificacionesPlantillas(
  filters: any = {},
  token?: string,
) {
  const response = await apiClient.get('/notificaciones-plantillas', {
    params: filters,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Obtener detalle de una plantilla
 */
export async function getNotificacionPlantilla(id: number, token?: string) {
  const response = await apiClient.get(`/notificaciones-plantillas/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data.data;
}

/**
 * Crear nueva plantilla de notificación
 */
export async function createNotificacionPlantilla(
  payload: any,
  token?: string,
) {
  const response = await apiClient.post(
    '/notificaciones-plantillas',
    payload,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return response.data;
}

/**
 * Actualizar plantilla de notificación
 */
export async function updateNotificacionPlantilla(
  id: number,
  payload: Partial<NotificacionPlantilla>,
  token?: string,
) {
  const response = await apiClient.put(
    `/notificaciones-plantillas/${id}`,
    payload,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return response.data;
}

/**
 * Eliminar plantilla de notificación (soft delete)
 */
export async function deleteNotificacionPlantilla(id: number, token?: string) {
  const response = await apiClient.delete(
    `/notificaciones-plantillas/${id}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return response.data;
}

/**
 * Activar plantilla
 */
export async function activarPlantilla(id: number, token?: string) {
  return updateNotificacionPlantilla(id, { estado: 'activa' }, token);
}

/**
 * Desactivar plantilla
 */
export async function desactivarPlantilla(id: number, token?: string) {
  return updateNotificacionPlantilla(id, { estado: 'inactiva' }, token);
}

/**
 * Obtener plantillas por tipo
 */
export async function getPlantillasByTipo(
  tipo: string,
  filters: any = {},
  token?: string,
) {
  return listNotificacionesPlantillas({ ...filters, tipo }, token);
}

const notificacionesPlantillasService = {
  listNotificacionesPlantillas,
  getNotificacionPlantilla,
  createNotificacionPlantilla,
  updateNotificacionPlantilla,
  deleteNotificacionPlantilla,
  activarPlantilla,
  desactivarPlantilla,
  getPlantillasByTipo,
};

export default notificacionesPlantillasService;
