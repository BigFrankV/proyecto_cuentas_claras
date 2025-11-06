import apiClient from './api';

export interface TarifaConsumo {
  id: number;
  comunidad_id: number;
  tipo_consumo: string;
  vigencia_desde: string;
  vigencia_hasta: string;
  valor_unitario: number;
  unidad_medida: string;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listTarifasConsumo(filters?: any) {
  return apiClient.get('/tarifas-consumo', { params: filters });
}

export async function getTarifaConsumo(id: number) {
  return apiClient.get(`/tarifas-consumo/${id}`);
}

export async function createTarifaConsumo(payload: any) {
  return apiClient.post('/tarifas-consumo', payload);
}

export async function updateTarifaConsumo(id: number, payload: any) {
  return apiClient.patch(`/tarifas-consumo/${id}`, payload);
}

export async function deleteTarifaConsumo(id: number) {
  return apiClient.delete(`/tarifas-consumo/${id}`);
}
