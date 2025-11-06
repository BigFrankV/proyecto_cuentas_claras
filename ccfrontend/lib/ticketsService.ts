import apiClient from './api';

export interface Ticket {
  id: number;
  numero_ticket: string;
  comunidad_id: number;
  usuario_id: number;
  asunto: string;
  descripcion: string;
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  prioridad: string;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listTickets(filters?: any) {
  return apiClient.get('/tickets', { params: filters });
}

export async function getTicket(id: number) {
  return apiClient.get(`/tickets/${id}`);
}

export async function createTicket(payload: any) {
  return apiClient.post('/tickets', payload);
}

export async function updateTicket(id: number, payload: any) {
  return apiClient.patch(`/tickets/${id}`, payload);
}

export async function deleteTicket(id: number) {
  return apiClient.delete(`/tickets/${id}`);
}
