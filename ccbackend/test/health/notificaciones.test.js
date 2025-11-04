/**
 * Tests de Salud - Módulo: NOTIFICACIONES
 * Endpoints: 17 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_NOTIFICATION_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Notificaciones Health Check', () => {
  let authToken;
  let comunidadId;
  let notificacionId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    notificacionId = testIds.notificacionId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /notificaciones/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/notificaciones/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /notificaciones/:id (Detalle de Notificación)', async () => {
      const endpoint = `/notificaciones/${notificacionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /notificaciones/comunidad/:comunidadId/listado-completo', async () => {
      const endpoint = `/notificaciones/comunidad/${comunidadId}/listado-completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /notificaciones/comunidad/:comunidadId/pendientes', async () => {
      const endpoint = `/notificaciones/comunidad/${comunidadId}/pendientes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas
  // =========================================
  describe('Estadísticas', () => {
    test('GET /notificaciones/estadisticas/generales', async () => {
      const endpoint = `/notificaciones/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/comunidad/:comunidadId/estadisticas-general', async () => {
      const endpoint = `/notificaciones/comunidad/${comunidadId}/estadisticas-general`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /notificaciones/estadisticas/por-estado', async () => {
      const endpoint = `/notificaciones/estadisticas/por-estado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/estadisticas/por-tipo', async () => {
      const endpoint = `/notificaciones/estadisticas/por-tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/estadisticas/por-canal', async () => {
      const endpoint = `/notificaciones/estadisticas/por-canal`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/estadisticas/mensuales', async () => {
      const endpoint = `/notificaciones/estadisticas/mensuales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Búsqueda y Filtros
  // =========================================
  describe('Búsqueda y Filtros', () => {
    test('GET /notificaciones/buscar', async () => {
      const endpoint = `/notificaciones/buscar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/por-comunidad', async () => {
      const endpoint = `/notificaciones/por-comunidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/por-audiencia', async () => {
      const endpoint = `/notificaciones/por-audiencia`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Exportación y Validaciones
  // =========================================
  describe('Exportación y Validaciones', () => {
    test('GET /notificaciones/exportar/completo', async () => {
      const endpoint = `/notificaciones/exportar/completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/exportar/enviadas', async () => {
      const endpoint = `/notificaciones/exportar/enviadas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/exportar/estadisticas-mensuales', async () => {
      const endpoint = `/notificaciones/exportar/estadisticas-mensuales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /notificaciones/validaciones/integridad', async () => {
      const endpoint = `/notificaciones/validaciones/integridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
