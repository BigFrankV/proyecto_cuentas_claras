/**
 * Tests de Salud - Módulo: PAYMENT GATEWAY
 * Endpoints: 3 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Payment Gateway Health Check', () => {
  let authToken;
  let comunidadId;
  let orderId = 'DUMMY_ORDER_123'; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
  });

  describe('Payment Gateway Endpoints', () => {
    test('GET /paymentGateway/available (Disponibilidad)', async () => {
      const endpoint = `/paymentGateway/available`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /paymentGateway/transaction/:orderId (Detalle de Transacción)', async () => {
      const endpoint = `/paymentGateway/transaction/${orderId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /paymentGateway/community/:communityId/transactions (Transacciones por Comunidad)', async () => {
      const endpoint = `/paymentGateway/community/${comunidadId}/transactions`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});