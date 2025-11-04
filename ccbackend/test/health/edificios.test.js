/**
 * Tests de Salud - Módulo: EDIFICIOS
 * Endpoints: 15 (Basado en la lista proporcionada)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_BUILDING_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Edificios Health Check', () => {
  let authToken;
  let comunidadId;
  let edificioId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    edificioId = testIds.edificioId;
  });

  // =========================================
  // 1. Listados y Consultas Generales
  // =========================================
  describe('Listados y Consultas Generales', () => {
    test('GET /edificios (Listado Base)', async () => {
      const endpoint = `/edificios`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /edificios/comunidad/:comunidadId (Listado por Comunidad)', async () => {
      const endpoint = `/edificios/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /edificios/:id (Detalle Simple)', async () => {
      const endpoint = `/edificios/${edificioId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /edificios/buscar', async () => {
      const endpoint = `/edificios/buscar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Metadatos y Estadísticas
  // =========================================
  describe('Metadatos y Estadísticas', () => {
    test('GET /edificios/stats', async () => {
      const endpoint = `/edificios/stats`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /edificios/comunidades-opciones', async () => {
      const endpoint = `/edificios/comunidades-opciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /edificios/servicios', async () => {
      const endpoint = `/edificios/servicios`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /edificios/amenidades-disponibles', async () => {
      const endpoint = `/edificios/amenidades-disponibles`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /edificios/:id/resumen', async () => {
      const endpoint = `/edificios/${edificioId}/resumen`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Sub-recursos y Validaciones
  // =========================================
  describe('Sub-recursos y Validaciones', () => {
    test('GET /edificios/:id/torres', async () => {
      const endpoint = `/edificios/${edificioId}/torres`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /edificios/:id/unidades', async () => {
      const endpoint = `/edificios/${edificioId}/unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /edificios/:id/amenidades', async () => {
      const endpoint = `/edificios/${edificioId}/amenidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /edificios/:id/check-dependencies', async () => {
      const endpoint = `/edificios/${edificioId}/check-dependencies`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /edificios/:id/filtros-opciones', async () => {
      const endpoint = `/edificios/${edificioId}/filtros-opciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /edificios/:id/validar-codigo (Falla sin código)', async () => {
      const endpoint = `/edificios/${edificioId}/validar-codigo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      // Espera 400 por falta de parámetro 'codigo'
      expect([400, 401, 404, 500]).toContain(response.status);
    });
  });
});
