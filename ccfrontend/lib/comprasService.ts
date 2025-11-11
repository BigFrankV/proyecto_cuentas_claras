/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Compra, ComprasResponse } from '@/types/compras';

import apiClient from './api';

export async function listCompras(
  comunidadId?: number | null,
  params: Record<string, any> = {},
): Promise<ComprasResponse> {
  if (typeof comunidadId === 'number') {
    params.comunidad_id = comunidadId;
  }
  const resp = await apiClient.get('/compras', { params });
  const raw = resp.data;
  const data = Array.isArray(raw) ? raw : (raw.data ?? raw.rows ?? []);
  const pagination = raw.pagination ?? undefined;
  return { data, pagination };
}

export async function getCompra(id: number): Promise<Compra> {
  const resp = await apiClient.get(`/compras/${id}`);
  return resp.data;
}

export async function createCompra(data: { comunidad_id: number; folio: string; fecha_emision: string; monto: number; tipo_doc: string; proveedor_id: number; descripcion: string }): Promise<Compra> {
  const { comunidad_id, ...payload } = data;
  const resp = await apiClient.post(`/compras/comunidad/${comunidad_id}`, payload);
  return resp.data;
}

export async function updateCompra(
  id: number,
  data: Partial<Compra>,
): Promise<Compra> {
  const resp = await apiClient.put(`/compras/${id}`, data);
  return resp.data;
}

export async function deleteCompra(id: number): Promise<void> {
  await apiClient.delete(`/compras/${id}`);
}
