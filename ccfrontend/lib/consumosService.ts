import apiClient from './api';

export interface Consumo {
  id: number;
  medidor_id: number;
  periodo: string;
  consumo: number;
  fecha_lectura: string;
  lectura_anterior: number;
  lectura_actual: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listConsumos(filters?: any) {
  return apiClient.get('/consumos', { params: filters });
}

export async function getConsumo(id: number) {
  return apiClient.get(`/consumos/${id}`);
}

export async function importarConsumos(payload: FormData) {
  return apiClient.post('/consumos', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteConsumo(id: number) {
  return apiClient.delete(`/consumos/${id}`);
}
