/**
 * Tests de Salud - Módulo: PAYMENT GATEWAY
 * Endpoints: 3 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Payment Gateway Health Check', () => {
  let authToken;
  let orderId = 1; // ID de orden de prueba
  let communityId = 1; // ID de comunidad de prueba

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Payment Gateway', () => {
    test('GET /payment-gateway/available (Gateways Disponibles)', async () => {
      const endpoint = `/payment-gateway/available`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /payment-gateway/available', response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /payment-gateway/transaction/:orderId (Detalle de Transacción)', async () => {
      const endpoint = `/payment-gateway/transaction/${orderId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(`GET /payment-gateway/transaction/${orderId}`, response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /payment-gateway/community/:communityId/transactions (Transacciones por Comunidad)', async () => {
      const endpoint = `/payment-gateway/community/${communityId}/transactions`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(`GET /payment-gateway/community/${communityId}/transactions`, response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});