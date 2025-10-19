import apiClient from './api';

export interface CategoriaGasto {
  id: number;
  nombre: string;
  tipo: string;
  cta_contable?: string;
  status: 'active' | 'inactive';
  comunidad: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriasResponse {
  data: CategoriaGasto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function listCategorias(comunidadId?: number): Promise<CategoriasResponse> {
  const endpoint = typeof comunidadId === 'number' 
    ? `/categorias-gasto/comunidad/${comunidadId}` 
    : '/categorias-gasto';
  
  const response = await apiClient.get(endpoint);
  return response.data;
}

export async function getCategoriaById(id: number): Promise<CategoriaGasto> {
  const response = await apiClient.get(`/categorias-gasto/${id}`);
  return response.data;
}

export async function createCategoria(comunidadId: number, data: Partial<CategoriaGasto>): Promise<CategoriaGasto> {
  const response = await apiClient.post(`/categorias-gasto/comunidad/${comunidadId}`, data);
  return response.data;
}

export async function updateCategoria(id: number, data: Partial<CategoriaGasto>): Promise<CategoriaGasto> {
  const response = await apiClient.patch(`/categorias-gasto/${id}`, data);
  return response.data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await apiClient.delete(`/categorias-gasto/${id}`);
}