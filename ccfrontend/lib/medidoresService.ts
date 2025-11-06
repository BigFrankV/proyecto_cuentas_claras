import apiClient from './api';
import http from './httpClient';
import type { Medidor, MedidoresListResponse, Reading } from '@/types/medidores';


export async function listMedidores(
  comunidadId: number | null,
  params: Record<string, any> = {},
): Promise<MedidoresListResponse> {
  if (!comunidadId) {
    return {
      data: [],
      pagination: { total: 0, limit: params.limit ?? 20, offset: 0, pages: 0 },
    };
  }
  const resp = await apiClient.get(`/medidores/comunidad/${comunidadId}`, {
    params,
  });
  return resp.data as MedidoresListResponse;
}

// Nuevo: endpoint global para superadmin (soporta comunidad_id para filtrar)
export async function listAllMedidores(
  params: Record<string, any> = {},
): Promise<MedidoresListResponse> {
  const resp = await apiClient.get('/medidores', { params });
  return resp.data as MedidoresListResponse;
}

export async function getMedidor(id: number): Promise<Medidor> {
  const resp = await apiClient.get(`/medidores/${id}`);
  return resp.data as Medidor;
}

export async function createMedidor(
  data: Partial<Medidor>,
): Promise<Medidor> {
  const resp = await apiClient.post('/medidores', data);
  return resp.data as Medidor;
}

export async function updateMedidor(
  id: number,
  data: Partial<Medidor>,
): Promise<Medidor> {
  const resp = await apiClient.put(`/medidores/${id}`, data);
  return resp.data as Medidor;
}

export async function deleteMedidor(id: number): Promise<any> {
  const resp = await apiClient.delete(`/medidores/${id}`);
  return resp.data;
}

export async function listLecturas(
  medidorId: number,
  params: Record<string, any> = {},
): Promise<{ data: Reading[]; pagination?: any }> {
  const resp = await apiClient.get(`/medidores/${medidorId}/lecturas`, {
    params,
  });
  return resp.data;
}

export async function createLectura(
  medidorId: number,
  payload: Record<string, any>,
): Promise<Reading> {
  const resp = await apiClient.post(
    `/medidores/${medidorId}/lecturas`,
    payload,
  );
  return resp.data as Reading;
}

export async function getConsumos(
  medidorId: number,
  params: Record<string, any> = {},
): Promise<{ data: any[] }> {
  const resp = await apiClient.get(`/medidores/${medidorId}/consumos`, {
    params,
  });
  return resp.data;
}

const base = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'; // <-- unificado con ConsumosPage

export async function getConsumoMensual(params: Record<string,string>) {
  const q = new URLSearchParams(params).toString();
  const res = await http.get(`/consumos/mensual?${q}`);
  return res.data;
}

export async function getConsumoTrimestral(params: Record<string,string>) {
  const q = new URLSearchParams(params).toString();
  const res = await http.get(`/consumos/trimestral?${q}`);
  return res.data;
}

export async function getConsumoSemanal(params: Record<string,string>) {
  const q = new URLSearchParams(params).toString();
  const res = await http.get(`/consumos/semanal?${q}`);
  return res.data;
}

export async function getConsumoEstadisticas(params: Record<string,string>) {
  const q = new URLSearchParams(params).toString();
  const res = await http.get(`/consumos/estadisticas?${q}`);
  return res.data;
}

export async function getConsumoDetalle(params: Record<string,string>) {
  const q = new URLSearchParams(params).toString();
  const res = await http.get(`/consumos/detalle?${q}`);
  return res.data;
}
