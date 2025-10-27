/**
 * Tests de Salud - Módulo: APELACIONES
 * Endpoints: 2 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Apelaciones Health Check', () => {
  let authToken;
  let apelacionId = 1; // ID de apelación de prueba

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Apelaciones', () => {
    test('GET /apelaciones (Lista de Apelaciones)', async () => {
      const endpoint = `/apelaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /apelaciones', response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /apelaciones/:id (Detalle de Apelación)', async () => {
      const endpoint = `/apelaciones/${apelacionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(`GET /apelaciones/${apelacionId}`, response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});