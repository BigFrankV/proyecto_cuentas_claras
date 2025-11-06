import apiClient from './api';

export interface ValorUTM {
  id: number;
  valor: number;
  mes: number;
  año: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listValoresUTM(filters?: any) {
  return apiClient.get('/valor-utm', { params: filters });
}

export async function getValorUTM(id: number) {
  return apiClient.get(`/valor-utm/${id}`);
}

export async function createValorUTM(payload: any) {
  return apiClient.post('/valor-utm', payload);
}

export async function updateValorUTM(id: number, payload: any) {
  return apiClient.patch(`/valor-utm/${id}`, payload);
}

export async function deleteValorUTM(id: number) {
  return apiClient.delete(`/valor-utm/${id}`);
}
