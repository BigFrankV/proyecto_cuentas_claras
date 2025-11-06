import apiClient from './api';

export interface Pago {
  id: number;
  order_id: string;
  monto: number;
  fecha_pago: string;
  estado: 'pendiente' | 'aprobado' | 'cancelado';
  metodo_pago: 'transferencia_bancaria' | 'webpay' | 'khipu' | 'servipag' | 'efectivo';
  referencia: string;
  numero_comprobante: string;
  comunidad_id: number;
  unidad_id: number;
  persona_id: number;
  usuario_id: number;
  activo: number;
  created_at: string;
  updated_at: string;
}

export async function listPagos(filters?: any) {
  return apiClient.get('/pagos', { params: filters });
}

export async function getPago(id: number) {
  return apiClient.get(`/pagos/${id}`);
}

export async function createPago(payload: any) {
  return apiClient.post('/pagos', payload);
}

export async function updatePago(id: number, payload: any) {
  return apiClient.put(`/pagos/${id}`, payload);
}

export async function deletePago(id: number) {
  return apiClient.delete(`/pagos/${id}`);
}

export async function confirmarPago(payload: any) {
  return apiClient.post('/pagos/confirmar-pago', payload);
}

export async function aplicarPago(id: number, payload: any) {
  return apiClient.post(`/pagos/${id}`, payload);
}
