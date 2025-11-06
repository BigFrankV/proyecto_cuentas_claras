import apiClient from './api';

export interface Conciliacion {
  id: number;
  comunidad_id: number;
  periodo: string;
  total_emitido: number;
  total_recibido: number;
  diferencia: number;
  estado: 'pendiente' | 'procesada' | 'enviada' | 'disponible' | 'duplicada';
  usuario_responsable: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listConciliaciones(filters?: any) {
  return apiClient.get('/conciliaciones', { params: filters });
}

export async function getConciliacion(id: number) {
  return apiClient.get(`/conciliaciones/${id}`);
}

export async function createConciliacion(payload: any) {
  return apiClient.post('/conciliaciones', payload);
}

export async function marcarPendiente(id: number) {
  return apiClient.patch(`/conciliaciones/${id}/pendiente`, {});
}

export async function marcarProcesada(id: number) {
  return apiClient.patch(`/conciliaciones/${id}/procesada`, {});
}

export async function marcarEnviada(id: number) {
  return apiClient.patch(`/conciliaciones/${id}/enviada`, {});
}

export async function marcarDisponible(id: number) {
  return apiClient.patch(`/conciliaciones/${id}/disponible`, {});
}

export async function marcarDuplicada(id: number) {
  return apiClient.patch(`/conciliaciones/${id}/duplicada`, {});
}
