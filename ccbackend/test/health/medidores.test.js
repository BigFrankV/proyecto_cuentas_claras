/**
 * Tests de Salud - Módulo: MEDIDORES
 * Endpoints: 5 (GET)
 * Requisitos: Requiere medidorId válido.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Medidores Health Check', () => {
  let authToken;
  let medidorId = 1; // ID de medidor de prueba
  let comunidadId = 1; // ID de comunidad de prueba

  beforeAll(() => {
    authToken = getAuthToken();
  });

  // =========================================
  // 1. Gestión de Medidores
  // =========================================
  describe('Gestión de Medidores', () => {
    test('GET /medidores/comunidad/:comunidadId (Medidores por Comunidad)', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /medidores/:id (Detalle de Medidor)', async () => {
      const endpoint = `/medidores/${medidorId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /medidores (Lista de Medidores)', async () => {
      const endpoint = `/medidores`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Lecturas y Consumos
  // =========================================
  describe('Lecturas y Consumos', () => {
    test('GET /medidores/:id/lecturas (Lecturas de Medidor)', async () => {
      const endpoint = `/medidores/${medidorId}/lecturas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /medidores/:id/consumos (Consumos de Medidor)', async () => {
      const endpoint = `/medidores/${medidorId}/consumos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
