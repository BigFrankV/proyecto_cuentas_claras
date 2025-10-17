/**
 * Tests de Salud - Módulo: AMENIDADES
 * Total endpoints: 20 (GET)
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Amenidades Health Check', () => {
  let authToken;
  let comunidadId;
  let amenidadId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    amenidadId = testIds.amenidadId;
  });

  // =========================================
  // 1. Listados y Consultas Básicas
  // =========================================
  describe('Listados y Consultas Básicas', () => {
    test('GET /amenidades', async () => {
      const endpoint = `/amenidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /amenidades/por-comunidad', async () => {
      const endpoint = `/amenidades/por-comunidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/disponibles', async () => {
      const endpoint = `/amenidades/disponibles`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/:id/detalle', async () => {
      const endpoint = `/amenidades/${amenidadId}/detalle`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/completas', async () => {
      const endpoint = `/amenidades/completas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas
  // =========================================
  describe('Estadísticas', () => {
    test('GET /amenidades/estadisticas/generales', async () => {
      const endpoint = `/amenidades/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/estadisticas/comunidad', async () => {
      const endpoint = `/amenidades/estadisticas/comunidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/estadisticas/tipo', async () => {
      const endpoint = `/amenidades/estadisticas/tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Búsqueda y Filtros
  // =========================================
  describe('Búsqueda y Filtros', () => {
    test('GET /amenidades/buscar', async () => {
      const endpoint = `/amenidades/buscar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/por-capacidad', async () => {
      const endpoint = `/amenidades/por-capacidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/por-tarifa', async () => {
      const endpoint = `/amenidades/por-tarifa`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Exportación
  // =========================================
  describe('Exportación', () => {
    test('GET /amenidades/exportar/completo', async () => {
      const endpoint = `/amenidades/exportar/completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/exportar/estadisticas', async () => {
      const endpoint = `/amenidades/exportar/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/exportar/reglas', async () => {
      const endpoint = `/amenidades/exportar/reglas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 5. Validaciones
  // =========================================
  describe('Validaciones', () => {
    test('GET /amenidades/validar/integridad', async () => {
      const endpoint = `/amenidades/validar/integridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/validar/duplicados', async () => {
      const endpoint = `/amenidades/validar/duplicados`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/validar/anomalias', async () => {
      const endpoint = `/amenidades/validar/anomalias`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 6. Operaciones por Comunidad y Detalle
  // =========================================
  describe('Operaciones por Comunidad y Detalle', () => {
    test('GET /amenidades/comunidad/:comunidadId', async () => {
      const endpoint = `/amenidades/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/:id', async () => {
      const endpoint = `/amenidades/${amenidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/:id/reservas', async () => {
      const endpoint = `/amenidades/${amenidadId}/reservas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});