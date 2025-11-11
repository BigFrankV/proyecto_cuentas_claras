import { CentroCosto, CentrosResponse } from '@/types/centrosCosto';

import apiClient from './api';

export async function listCentros(
  comunidadId?: number,
): Promise<CentrosResponse> {
  const endpoint =
    typeof comunidadId === 'number'
      ? `/centros-costo/comunidad/${comunidadId}`
      : '/centros-costo';

  const response = await apiClient.get(endpoint);
  return response.data;
}

export async function getCentroById(id: number): Promise<CentroCosto> {
  const response = await apiClient.get(`/centros-costo/${id}`);
  return response.data;
}

export async function createCentro(
  comunidadId: number,
  data: { nombre: string; codigo: string },
): Promise<CentroCosto> {
  const response = await apiClient.post(
    `/centros-costo/comunidad/${comunidadId}`,
    data,
  );
  return response.data;
}

export async function updateCentro(
  id: number,
  data: Partial<CentroCosto>,
): Promise<CentroCosto> {
  const response = await apiClient.patch(`/centros-costo/${id}`, data);
  return response.data;
}

export async function deleteCentro(id: number): Promise<void> {
  await apiClient.delete(`/centros-costo/${id}`);
}
