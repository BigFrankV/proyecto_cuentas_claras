/**
 * Tests de Salud - Módulo: PAGOS
 * Endpoints: 13 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID, DUMMY_PAGO_ID y DUMMY_UNIDAD_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Pagos Health Check', () => {
  let authToken;
  let comunidadId;
  let pagoId; 
  let unidadId; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    pagoId = testIds.pagoId;
    unidadId = testIds.unidadId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /pagos/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /pagos/:id (Detalle de Pago)', async () => {
      const endpoint = `/pagos/${pagoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/:id/aplicaciones', async () => {
      const endpoint = `/pagos/${pagoId}/aplicaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /pagos/unidad/:unidadId/historial', async () => {
      const endpoint = `/pagos/unidad/${unidadId}/historial`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /pagos/comunidad/:comunidadId/pendientes', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/pendientes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /pagos/comunidad/:comunidadId/estadisticas', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /pagos/comunidad/:comunidadId/estadisticas/estado', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/estadisticas/estado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /pagos/comunidad/:comunidadId/estadisticas/metodo', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/estadisticas/metodo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /pagos/comunidad/:comunidadId/estadisticas/periodo', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/estadisticas/periodo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /pagos/comunidad/:comunidadId/por-residente', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/por-residente`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
  
  // =========================================
  // 3. Conciliación y Validaciones
  // =========================================
  describe('Conciliación y Validaciones', () => {
    test('GET /pagos/comunidad/:comunidadId/conciliacion', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/conciliacion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /pagos/:id/webhooks', async () => {
      const endpoint = `/pagos/${pagoId}/webhooks`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /pagos/comunidad/:comunidadId/validar', async () => {
      const endpoint = `/pagos/comunidad/${comunidadId}/validar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});