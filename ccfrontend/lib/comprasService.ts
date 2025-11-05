/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Compra, ComprasResponse } from '@/types/compras';

import apiClient from './api';

export async function listCompras(
  comunidadId?: number | null,
  params: Record<string, any> = {}
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
