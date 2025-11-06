import apiClient from './api';

export interface Membresia {
  id: number;
  comunidad_id: number;
  numero_membresia: string;
  persona_id: number;
  tipo_membresia_id: number;
  fecha_inicio: string;
  fecha_termino: string;
  estado: 'activa' | 'inactiva' | 'suspendida' | 'cancelada';
  monto_cuota: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listMembresias(filters?: any) {
  return apiClient.get('/membresias', { params: filters });
}

export async function getMembresia(id: number) {
  return apiClient.get(`/membresias/${id}`);
}

export async function createMembresia(payload: any) {
  return apiClient.post('/membresias', payload);
}

export async function updateMembresia(id: number, payload: any) {
  return apiClient.patch(`/membresias/${id}`, payload);
}

export async function deleteMembresia(id: number) {
  return apiClient.delete(`/membresias/${id}`);
}

export async function listTiposMembresia(filters?: any) {
  return apiClient.get('/membresias/tipos', { params: filters });
}

export async function createTipoMembresia(payload: any) {
  return apiClient.post('/membresias/tipos', payload);
}

export async function updateTipoMembresia(id: number, payload: any) {
  return apiClient.patch(`/membresias/tipos/${id}`, payload);
}

export async function deleteTipoMembresia(id: number) {
  return apiClient.delete(`/membresias/tipos/${id}`);
}
