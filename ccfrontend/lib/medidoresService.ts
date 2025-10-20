import apiClient from './api';
import type { Medidor, MedidoresListResponse, Reading } from '@/types/medidores';

export async function listMedidores(comunidadId: number | null, params: Record<string, any> = {}): Promise<MedidoresListResponse> {
  if (!comunidadId) return { data: [], pagination: { total: 0, limit: params.limit ?? 20, offset: 0, pages: 0 } };
  const resp = await apiClient.get(`/medidores/comunidad/${comunidadId}`, { params });
  return resp.data as MedidoresListResponse;
}

// Nuevo: endpoint global para superadmin (soporta comunidad_id para filtrar)
export async function listAllMedidores(params: Record<string, any> = {}): Promise<MedidoresListResponse> {
  const resp = await apiClient.get(`/medidores`, { params });
  return resp.data as MedidoresListResponse;
}

export async function getMedidor(id: number): Promise<Medidor> {
  const resp = await apiClient.get(`/medidores/${id}`);
  return resp.data as Medidor;
}

export async function deleteMedidor(id: number): Promise<any> {
  const resp = await apiClient.delete(`/medidores/${id}`);
  return resp.data;
}

export async function listLecturas(medidorId: number, params: Record<string, any> = {}): Promise<{ data: Reading[]; pagination?: any }> {
  const resp = await apiClient.get(`/medidores/${medidorId}/lecturas`, { params });
  return resp.data;
}

export async function createLectura(medidorId: number, payload: Record<string, any>): Promise<Reading> {
  const resp = await apiClient.post(`/medidores/${medidorId}/lecturas`, payload);
  return resp.data as Reading;
}

export async function getConsumos(medidorId: number, params: Record<string, any> = {}): Promise<{ data: any[] }> {
  const resp = await apiClient.get(`/medidores/${medidorId}/consumos`, { params });
  return resp.data;
}