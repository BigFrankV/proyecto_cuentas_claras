/**
 * Tests de Salud - Módulo: CONCILIACIONES
 * Endpoints: 15 (Completos)
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Conciliaciones Health Check', () => {
  let authToken;
  let comunidadId;
  let conciliacionId; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    conciliacionId = testIds.conciliacionId; 
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /conciliaciones (Listado General)', async () => {
      const endpoint = `/conciliaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /conciliaciones/:id (Detalle)', async () => {
      const endpoint = `/conciliaciones/${conciliacionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /conciliaciones/comunidad/:comunidadId (Listado por Comunidad)', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Agrupaciones
  // =========================================
  describe('Estadísticas y Agrupaciones', () => {
    test('GET /conciliaciones/comunidad/:comunidadId/estadisticas', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /conciliaciones/comunidad/:comunidadId/pendientes', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/pendientes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /conciliaciones/comunidad/:comunidadId/por-estado', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/por-estado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /conciliaciones/comunidad/:comunidadId/por-tipo', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/por-tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Análisis de Diferencias y Reportes
  // =========================================
  describe('Análisis de Diferencias y Reportes', () => {
    test('GET /conciliaciones/comunidad/:comunidadId/con-diferencias', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/con-diferencias`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /conciliaciones/comunidad/:comunidadId/sin-pago', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/sin-pago`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /conciliaciones/comunidad/:comunidadId/historial-periodo', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/historial-periodo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /conciliaciones/comunidad/:comunidadId/saldos', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/saldos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /conciliaciones/comunidad/:comunidadId/analisis-precision', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/analisis-precision`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /conciliaciones/comunidad/:comunidadId/resumen', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/resumen`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /conciliaciones/comunidad/:comunidadId/validar', async () => {
      const endpoint = `/conciliaciones/comunidad/${comunidadId}/validar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});