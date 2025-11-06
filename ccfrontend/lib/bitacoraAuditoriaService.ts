import apiClient from './api';

export interface BitacoraAuditoria {
  id: number;
  numero_registro: string;
  tipo: string;
  prioridad: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  usuario_id: number;
  accion: string;
  tabla_afectada: string;
  registro_id: number;
  cambios: string;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listBitacoraAuditoria(filters?: any) {
  return apiClient.get('/bitacora-auditoria', { params: filters });
}

export async function getBitacoraAuditoria(id: number) {
  return apiClient.get(`/bitacora-auditoria/${id}`);
}

export async function createBitacoraAuditoria(payload: any) {
  return apiClient.post('/bitacora-auditoria', payload);
}

export async function updateBitacoraAuditoria(id: number, payload: any) {
  return apiClient.put(`/bitacora-auditoria/${id}`, payload);
}

export async function deleteBitacoraAuditoria(id: number) {
  return apiClient.delete(`/bitacora-auditoria/${id}`);
}
