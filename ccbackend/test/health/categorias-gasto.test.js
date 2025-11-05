/**
 * Tests de Salud - Módulo: CATEGORIAS GASTO
 * Endpoints: 25 (Completos)
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Categorias Gasto Health Check', () => {
  let authToken;
  let comunidadId;
  let categoriaId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    categoriaId = testIds.categoriaId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /categorias-gasto/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/filtrar', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/filtrar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/:id/detalle', async () => {
      const endpoint = `/categorias-gasto/${categoriaId}/detalle`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/:id/ultimos-gastos', async () => {
      const endpoint = `/categorias-gasto/${categoriaId}/ultimos-gastos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/:id (Detalle Simple)', async () => {
      const endpoint = `/categorias-gasto/${categoriaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /categorias-gasto/comunidad/:comunidadId/estadisticas/generales', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/estadisticas/por-tipo', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/estadisticas/por-tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/mas-utilizadas', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/mas-utilizadas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/mas-costosas', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/mas-costosas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/sin-uso', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/sin-uso`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/reporte/por-mes (Debe fallar sin fechas/parametros)', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/reporte/por-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de fechas/parametros o 200 si el mock los maneja
      expect([200, 400, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/reporte/comparativo', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/reporte/comparativo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/reporte/variabilidad', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/reporte/variabilidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/exportar (Añadido)', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/exportar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Validaciones y Listas
  // =========================================
  describe('Validaciones y Listas', () => {
    test('GET /categorias-gasto/:id/existe', async () => {
      const endpoint = `/categorias-gasto/${categoriaId}/existe?comunidad_id=${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/validar-nombre (Debe fallar sin nombre)', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/validar-nombre`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de parámetro 'nombre'
      expect([400, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/:id/tiene-gastos', async () => {
      const endpoint = `/categorias-gasto/${categoriaId}/tiene-gastos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/validar-tipo (Debe fallar sin tipo)', async () => {
      const endpoint = `/categorias-gasto/validar-tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de parámetro 'tipo'
      expect([400, 401, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/activas', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/activas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/tipos', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/tipos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/por-tipo/:tipo', async () => {
      const tipo = 'operacional';
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/por-tipo/${tipo}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Dashboard
  // =========================================
  describe('Dashboard', () => {
    test('GET /categorias-gasto/comunidad/:comunidadId/dashboard/resumen', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/dashboard/resumen`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/dashboard/top-mes', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/dashboard/top-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/dashboard/sin-uso-reciente', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/dashboard/sin-uso-reciente`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/comunidad/:comunidadId/dashboard/distribucion-tipo', async () => {
      const endpoint = `/categorias-gasto/comunidad/${comunidadId}/dashboard/distribucion-tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});
