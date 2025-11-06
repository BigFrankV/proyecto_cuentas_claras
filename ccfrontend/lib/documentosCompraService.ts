import apiClient from './api';

export interface DocumentoCompra {
  id: number;
  compra_id: number;
  nombre_documento: string;
  tipo_documento: string;
  url_documento: string;
  fecha_carga: string;
  usuario_id: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listDocumentosCompra(filters?: any) {
  return apiClient.get('/documentos-compra', { params: filters });
}

export async function getDocumentoCompra(id: number) {
  return apiClient.get(`/documentos-compra/${id}`);
}

export async function createDocumentoCompra(payload: any) {
  return apiClient.post('/documentos-compra', payload);
}

export async function updateDocumentoCompra(id: number, payload: any) {
  return apiClient.patch(`/documentos-compra/${id}`, payload);
}

export async function deleteDocumentoCompra(id: number) {
  return apiClient.delete(`/documentos-compra/${id}`);
}
