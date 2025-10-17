/**
 * Tests de Salud - Módulo: MEDIDORES
 * Endpoints: 12 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_MEDIDOR_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Medidores Health Check', () => {
  let authToken;
  let comunidadId;
  let medidorId; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    medidorId = testIds.medidorId; 
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /medidores/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /medidores/comunidad/:comunidadId/search', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/search`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /medidores/:id (Detalle de Medidor)', async () => {
      const endpoint = `/medidores/${medidorId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /medidores/:id/lecturas', async () => {
      const endpoint = `/medidores/${medidorId}/lecturas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /medidores/:id/consumos', async () => {
      const endpoint = `/medidores/${medidorId}/consumos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /medidores/comunidad/:comunidadId/estadisticas', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /medidores/comunidad/:comunidadId/estadisticas/tipo', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/estadisticas/tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /medidores/comunidad/:comunidadId/estadisticas/edificio', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/estadisticas/edificio`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /medidores/comunidad/:comunidadId/export', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/export`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /medidores/comunidad/:comunidadId/export/lecturas', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/export/lecturas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
  
  // =========================================
  // 3. Validaciones
  // =========================================
  describe('Validaciones', () => {
    test('GET /medidores/comunidad/:comunidadId/validar/lecturas-inconsistentes', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/validar/lecturas-inconsistentes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /medidores/comunidad/:comunidadId/validar/integridad', async () => {
      const endpoint = `/medidores/comunidad/${comunidadId}/validar/integridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});