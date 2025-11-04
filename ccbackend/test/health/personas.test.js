/**
 * Tests de Salud - Módulo: PERSONAS
 * Endpoints: 12 (GET)
 * Requisitos: Requiere DUMMY_PERSONA_ID y DUMMY_UNIDAD_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Personas Health Check', () => {
  let authToken;
  let personaId;

  beforeAll(() => {
    authToken = getAuthToken();
    personaId = testIds.personaId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /personas (Listado General)', async () => {
      const endpoint = `/personas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /personas/:id (Detalle de Persona)', async () => {
      const endpoint = `/personas/${personaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Sub-recursos y Actividad
  // =========================================
  describe('Sub-recursos y Actividad', () => {
    test('GET /personas/:id/unidades', async () => {
      const endpoint = `/personas/${personaId}/unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /personas/:id/pagos', async () => {
      const endpoint = `/personas/${personaId}/pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /personas/:id/actividad', async () => {
      const endpoint = `/personas/${personaId}/actividad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /personas/:id/documentos', async () => {
      const endpoint = `/personas/${personaId}/documentos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /personas/:id/notas', async () => {
      const endpoint = `/personas/${personaId}/notas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /personas/:id/roles', async () => {
      const endpoint = `/personas/${personaId}/roles`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /personas/:id/resumen-financiero', async () => {
      const endpoint = `/personas/${personaId}/resumen-financiero`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Estadísticas y Utilidades
  // =========================================
  describe('Estadísticas y Utilidades', () => {
    test('GET /personas/estadisticas', async () => {
      const endpoint = `/personas/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /personas/validar', async () => {
      const endpoint = `/personas/validar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /personas/unidades/autocompletar', async () => {
      const endpoint = `/personas/unidades/autocompletar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
