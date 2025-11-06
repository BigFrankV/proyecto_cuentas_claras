import apiClient from './api';

export interface Edificio {
  id: number;
  comunidad_id: number;
  nombre: string;
  direccion: string;
  cantidad_plantas: number;
  cantidad_torres: number;
  año_construccion: number;
  administrador_id: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listEdificios(filters?: any) {
  return apiClient.get('/edificios', { params: filters });
}

export async function getEdificio(id: number) {
  return apiClient.get(`/edificios/${id}`);
}

export async function createEdificio(payload: any) {
  return apiClient.post('/edificios', payload);
}

export async function updateEdificio(id: number, payload: any) {
  return apiClient.put(`/edificios/${id}`, payload);
}

export async function deleteEdificio(id: number) {
  return apiClient.delete(`/edificios/${id}`);
}

export async function agregarTorre(id: number, payload: any) {
  return apiClient.post(`/edificios/${id}/torres`, payload);
}

export async function actualizarTorre(id: number, torreId: number, payload: any) {
  return apiClient.patch(`/edificios/${id}/torres/${torreId}`, payload);
}

export async function agregarPlanta(id: number, payload: any) {
  return apiClient.post(`/edificios/${id}/plantas`, payload);
}

export async function agregarEspacioComun(id: number, payload: any) {
  return apiClient.post(`/edificios/${id}/espacios-comunes`, payload);
}
