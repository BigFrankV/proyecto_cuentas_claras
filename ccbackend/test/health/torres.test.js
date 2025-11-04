/**
 * Tests de Salud - Módulo: TORRES
 * Endpoints: 20 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID, DUMMY_EDIFICIO_ID y DUMMY_TORRE_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Torres Health Check', () => {
  let authToken;
  let comunidadId;
  let edificioId;
  let torreId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    edificioId = testIds.edificioId;
    torreId = testIds.torreId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /torres/edificio/:edificioId/listado (Listado por Edificio)', async () => {
      const endpoint = `/torres/edificio/${edificioId}/listado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/edificio/:edificioId/buscar', async () => {
      const endpoint = `/torres/edificio/${edificioId}/buscar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/buscar (Búsqueda General)', async () => {
      const endpoint = `/torres/buscar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /torres/:id/detalle', async () => {
      const endpoint = `/torres/${torreId}/detalle`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/:id/unidades', async () => {
      const endpoint = `/torres/${torreId}/unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/:id/unidades/filtradas', async () => {
      const endpoint = `/torres/${torreId}/unidades/filtradas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/edificio/:edificioId/dropdown', async () => {
      const endpoint = `/torres/edificio/${edificioId}/dropdown`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/comunidad/:comunidadId', async () => {
      const endpoint = `/torres/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /torres/edificio/:edificioId (Listado Base por Edificio)', async () => {
      const endpoint = `/torres/edificio/${edificioId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /torres/edificio/:edificioId/estadisticas', async () => {
      const endpoint = `/torres/edificio/${edificioId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/:id/estadisticas-por-piso', async () => {
      const endpoint = `/torres/${torreId}/estadisticas-por-piso`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/top-unidades', async () => {
      const endpoint = `/torres/top-unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /torres/estadisticas-globales', async () => {
      const endpoint = `/torres/estadisticas-globales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /torres/edificio/:edificioId/distribucion', async () => {
      const endpoint = `/torres/edificio/${edificioId}/distribucion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/edificio/:edificioId/comparativa-superficies', async () => {
      const endpoint = `/torres/edificio/${edificioId}/comparativa-superficies`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/reportes/completo', async () => {
      const endpoint = `/torres/reportes/completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /torres/reportes/ocupacion', async () => {
      const endpoint = `/torres/reportes/ocupacion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Validaciones
  // =========================================
  describe('Validaciones', () => {
    test('GET /torres/edificio/:edificioId/validar-codigo (Falla sin código)', async () => {
      const endpoint = `/torres/edificio/${edificioId}/validar-codigo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de parámetro 'codigo'
      expect([400, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/edificio/:edificioId/siguiente-codigo', async () => {
      const endpoint = `/torres/edificio/${edificioId}/siguiente-codigo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /torres/:id/puede-eliminar', async () => {
      const endpoint = `/torres/${torreId}/puede-eliminar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
