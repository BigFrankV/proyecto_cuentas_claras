/**
 * Tests de Salud - Módulo: COMPRAS
 * Endpoints: 1 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Compras Health Check', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Compras', () => {
    test('GET /compras (Lista de Compras)', async () => {
      const endpoint = `/compras`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /compras', response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});