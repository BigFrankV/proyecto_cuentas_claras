import apiClient from './api';

export interface Notificacion {
  id: number;
  comunidad_id: number;
  usuario_id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  leida: boolean;
  fecha_lectura: string;
  fecha: string;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listNotificaciones(filters?: any) {
  return apiClient.get('/notificaciones', { params: filters });
}

export async function getNotificacion(id: number) {
  return apiClient.get(`/notificaciones/${id}`);
}

export async function createNotificacion(payload: any) {
  return apiClient.post('/notificaciones', payload);
}

export async function marcarLeida(id: number) {
  return apiClient.patch(`/notificaciones/${id}/marcar-leida`, {});
}

export async function deleteNotificacion(id: number) {
  return apiClient.delete(`/notificaciones/${id}`);
}
