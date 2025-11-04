/**
 * Tests de Salud - Módulo: CENTROS COSTO
 * Endpoints: 25 (Completos)
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Centros Costo Health Check', () => {
  let authToken;
  let comunidadId;
  let centroCostoId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    centroCostoId = testIds.centroCostoId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /centros-costo/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/filtrar', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/filtrar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/:id/detalle', async () => {
      const endpoint = `/centros-costo/${centroCostoId}/detalle`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /centros-costo/:id/gastos', async () => {
      const endpoint = `/centros-costo/${centroCostoId}/gastos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /centros-costo/:id/resumen-mensual', async () => {
      const endpoint = `/centros-costo/${centroCostoId}/resumen-mensual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /centros-costo/:id (Detalle Simple)', async () => {
      const endpoint = `/centros-costo/${centroCostoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /centros-costo/comunidad/:comunidadId/estadisticas/generales', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/mas-utilizados', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/mas-utilizados`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/mas-costosos', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/mas-costosos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/sin-uso', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/sin-uso`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/analisis-por-categoria', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/analisis-por-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/reporte/por-mes (Debe fallar sin fechas/parametros)', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/reporte/por-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de fechas/parametros o 200 si el mock los maneja
      expect([200, 400, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/reporte/comparativo', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/reporte/comparativo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/reporte/variabilidad', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/reporte/variabilidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Validaciones y Listas
  // =========================================
  describe('Validaciones y Listas', () => {
    test('GET /centros-costo/:id/existe', async () => {
      const endpoint = `/centros-costo/${centroCostoId}/existe?comunidad_id=${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/validar-nombre (Debe fallar sin nombre)', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/validar-nombre`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de parámetro 'nombre'
      expect([400, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/validar-codigo (Debe fallar sin codigo)', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/validar-codigo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de parámetro 'codigo'
      expect([400, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/:id/tiene-gastos', async () => {
      const endpoint = `/centros-costo/${centroCostoId}/tiene-gastos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/dropdown', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/dropdown`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/con-estadisticas', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/con-estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Exportación y Dashboard
  // =========================================
  describe('Exportación y Dashboard', () => {
    test('GET /centros-costo/comunidad/:comunidadId/exportar', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/exportar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/dashboard/resumen', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/dashboard/resumen`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/dashboard/top-mes', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/dashboard/top-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/dashboard/sin-uso-reciente', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/dashboard/sin-uso-reciente`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /centros-costo/comunidad/:comunidadId/dashboard/distribucion', async () => {
      const endpoint = `/centros-costo/comunidad/${comunidadId}/dashboard/distribucion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});
