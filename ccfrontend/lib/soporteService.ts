import apiClient from './api';

export interface Soporte {
  id: number;
  numero_ticket: string;
  comunidad_id: number;
  usuario_id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listTickets(filters?: any) {
  return apiClient.get('/soporte/tickets', { params: filters });
}

export async function getTicket(id: number) {
  return apiClient.get(`/soporte/tickets/${id}`);
}

export async function createTicket(payload: any) {
  return apiClient.post('/soporte/tickets', payload);
}

export async function updateTicket(id: number, payload: any) {
  return apiClient.patch(`/soporte/tickets/${id}`, payload);
}

export async function deleteTicket(id: number) {
  return apiClient.delete(`/soporte/tickets/${id}`);
}

export async function agregarRespuesta(payload: any) {
  return apiClient.post('/soporte/respuestas', payload);
}

export async function eliminarRespuesta(id: number) {
  return apiClient.delete(`/soporte/respuestas/${id}`);
}

export async function listCategorias(filters?: any) {
  return apiClient.get('/soporte/categorias', { params: filters });
}

export async function createCategoria(payload: any) {
  return apiClient.post('/soporte/categorias', payload);
}

export async function listPrioridades(filters?: any) {
  return apiClient.get('/soporte/prioridades', { params: filters });
}

export async function createPrioridad(payload: any) {
  return apiClient.post('/soporte/prioridades', payload);
}

export async function updatePrioridad(id: number, payload: any) {
  return apiClient.patch(`/soporte/prioridades/${id}`, payload);
}
