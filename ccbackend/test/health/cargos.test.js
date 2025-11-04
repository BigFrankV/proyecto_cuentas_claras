/**
 * Tests de Salud - Módulo: CARGOS
 * Endpoints: 15 (todos los listados y estadísticos)
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Cargos Health Check', () => {
  let authToken;
  let comunidadId;
  let cargoId;
  let unidadId; // Añadido para prueba de unidad

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    cargoId = testIds.cargoId;
    unidadId = testIds.unidadId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /cargos/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/:id (Detalle de Cargo)', async () => {
      const endpoint = `/cargos/${cargoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /cargos/:id/detalle (Detalle de Partidas)', async () => {
      const endpoint = `/cargos/${cargoId}/detalle`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /cargos/:id/pagos (Pagos Aplicados)', async () => {
      const endpoint = `/cargos/${cargoId}/pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /cargos/:id/historial-pagos (Historial Completo de Pagos)', async () => {
      const endpoint = `/cargos/${cargoId}/historial-pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Consultas por Unidad
  // =========================================
  describe('Consultas por Unidad', () => {
    test('GET /cargos/unidad/:id (Historial por Unidad)', async () => {
      const endpoint = `/cargos/unidad/${unidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /cargos/comunidad/:comunidadId/estadisticas', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/periodo/:periodo (Por Período)', async () => {
      const periodo = '2024-01'; // Usar un período dummy
      const endpoint = `/cargos/comunidad/${comunidadId}/periodo/${periodo}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/vencidos', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/vencidos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/con-interes', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/con-interes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/por-estado', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/por-estado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/resumen-pagos', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/resumen-pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/por-categoria', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/por-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /cargos/comunidad/:comunidadId/validacion', async () => {
      const endpoint = `/cargos/comunidad/${comunidadId}/validacion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});
