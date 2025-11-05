/**
 * Tests de Salud - Módulo: REPORTES
 * Endpoints: 16 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Reportes Health Check', () => {
  let authToken;
  let comunidadId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
  });

  // =========================================
  // 1. Reportes Financieros
  // =========================================
  describe('Reportes Financieros', () => {
    test('GET /reportes/comunidad/:comunidadId/resumen-financiero', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/resumen-financiero`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/kpis-financieros', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/kpis-financieros`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/tendencias-mensuales', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/tendencias-mensuales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/morosidad-unidades', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/morosidad-unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/estadisticas-morosidad', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/estadisticas-morosidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Reportes de Gastos y Servicios
  // =========================================
  describe('Reportes de Gastos y Servicios', () => {
    test('GET /reportes/comunidad/:comunidadId/gastos-detallados', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/gastos-detallados`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/gastos-por-categoria', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/gastos-por-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/consumo-servicios', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/consumo-servicios`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/estadisticas-consumo', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/estadisticas-consumo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Reportes Operacionales
  // =========================================
  describe('Reportes Operacionales', () => {
    test('GET /reportes/comunidad/:comunidadId/tickets-soporte', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/tickets-soporte`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/reservas-amenidades', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/reservas-amenidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/ingresos-amenidades', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/ingresos-amenidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/multas-sanciones', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/multas-sanciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/estadisticas-multas', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/estadisticas-multas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/bitacora-conserjeria', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/bitacora-conserjeria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/reporte-completo', async () => {
      const endpoint = `/reportes/comunidad/${comunidadId}/reporte-completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});
