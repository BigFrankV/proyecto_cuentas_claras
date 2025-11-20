import apiClient from './api';

export interface PaymentResponse {
  status: string;
  transaction_id: string;
  message: string;
  redirect_url?: string;
  amount: number;
  currency: string;
}

export async function iniciarPagoWebpay(payload: any) {
  return apiClient.post('/payment-gateway/webpay/init', payload);
}

export async function confirmarPagoWebpay(payload: any) {
  return apiClient.post('/payment-gateway/confirm-payment', payload);
}

export async function iniciarPagoKhipu(payload: any) {
  return apiClient.post('/payment-gateway/khipu/init', payload);
}

export async function procesarPagoServipag(payload: any) {
  return apiClient.post('/payment-gateway/servipag', payload);
}

export async function verificarEstadoPago(transactionId: string) {
  return apiClient.get(`/payment-gateway/status/${transactionId}`);
}

export async function getAvailableGateways() {
  return apiClient.get('/gateway/available');
}

export async function reembolsarPago(transactionId: string, payload: any) {
  return apiClient.post(`/payment-gateway/refund/${transactionId}`, payload);
}
