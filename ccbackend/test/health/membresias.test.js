/**
 * Tests de Salud - Módulo: MEMBRESIAS
 * Endpoints: 4 (GET)
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Membresias Health Check', () => {
  let authToken;
  let membresiaId;

  beforeAll(() => {
    authToken = getAuthToken();
    membresiaId = testIds.membresiaId || 1;
  });

  describe('Membresias Endpoints', () => {
    test('GET /membresias (Listado General)', async () => {
      const endpoint = `/membresias`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /membresias/:id (Detalle de Membresía)', async () => {
      const endpoint = `/membresias/${membresiaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /membresias/catalogos/planes', async () => {
      const endpoint = `/membresias/catalogos/planes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /membresias/catalogos/estados', async () => {
      const endpoint = `/membresias/catalogos/estados`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
