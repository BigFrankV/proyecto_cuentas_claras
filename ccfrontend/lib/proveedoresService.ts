import type { Proveedor, ProveedoresResponse } from '@/types/proveedores';

import apiClient from './api';

export async function listProveedores(comunidadId?: number | null, params: Record<string, any> = {}): Promise<ProveedoresResponse> {
  const endpoint = typeof comunidadId === 'number'
    ? `/proveedores/comunidad/${comunidadId}`
    : '/proveedores'; // global (superadmin / filtrado por middleware en backend)

  const resp = await apiClient.get(endpoint, { params });

  // Normalizar distintos formatos que usa el backend
  // - Si backend devuelve { data, pagination } -> use resp.data.data
  // - Si devuelve array -> use resp.data (array)
  const raw = resp.data;
  let data: Proveedor[] = [];
  let pagination: ProveedoresResponse['pagination'] | undefined = undefined;

  if (Array.isArray(raw)) {
    data = raw;
  } else if (raw && Array.isArray(raw.data)) {
    data = raw.data;
    pagination = raw.pagination ?? undefined;
  } else if (raw && raw.data && Array.isArray(raw.data.data)) {
    data = raw.data.data;
    pagination = raw.data.pagination ?? undefined;
  } else {
    // fallback: try resp.data.rows or resp.data.items
    data = raw.rows ?? raw.items ?? [];
    if (raw.pagination) {pagination = raw.pagination;}
  }

  return { data, pagination };
}

export async function getProveedor(id: number): Promise<Proveedor> {
  const resp = await apiClient.get(`/proveedores/${id}`);
  return resp.data;
}

export async function deleteProveedor(id: number): Promise<void> {
  await apiClient.delete(`/proveedores/${id}`);
}

export async function createProveedor(comunidadId: number, payload: Partial<Proveedor>) {
  const resp = await apiClient.post(`/proveedores/comunidad/${comunidadId}`, payload);
  return resp.data;
}

export async function updateProveedor(id: number, payload: Partial<Proveedor>) {
  const resp = await apiClient.patch(`/proveedores/${id}`, payload);
  return resp.data;
}