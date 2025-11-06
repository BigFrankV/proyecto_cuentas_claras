import apiClient from './api';

export interface Torre {
  id: number;
  edificio_id: number;
  nombre: string;
  cantidad_plantas: number;
  portero_id: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listTorres(filters?: any) {
  return apiClient.get('/torres', { params: filters });
}

export async function getTorre(id: number) {
  return apiClient.get(`/torres/${id}`);
}

export async function createTorre(payload: any) {
  return apiClient.post('/torres', payload);
}

export async function updateTorre(id: number, payload: any) {
  return apiClient.patch(`/torres/${id}`, payload);
}

export async function deleteTorre(id: number) {
  return apiClient.delete(`/torres/${id}`);
}

export async function agregarPlanta(id: number, payload: any) {
  return apiClient.post(`/torres/${id}/plantas`, payload);
}

export async function agregarEspacioComun(id: number, plantaId: number, payload: any) {
  return apiClient.post(`/torres/${id}/plantas/${plantaId}/espacios-comunes`, payload);
}

export async function actualizarEspacioComun(id: number, plantaId: number, espacioId: number, payload: any) {
  return apiClient.patch(`/torres/${id}/plantas/${plantaId}/espacios-comunes/${espacioId}`, payload);
}

export async function eliminarEspacioComun(id: number, plantaId: number, espacioId: number) {
  return apiClient.delete(`/torres/${id}/plantas/${plantaId}/espacios-comunes/${espacioId}`);
}
