/**
 * Tests de Salud - Módulo: COMUNIDADES
 * Endpoints: 13
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Comunidades Health Check', () => {
  let authToken;
  let comunidadId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
  });

  describe('Comunidades Endpoints', () => {
    test('GET /comunidades (Listado General)', async () => {
      const endpoint = `/comunidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id (Detalle de Comunidad)', async () => {
      const endpoint = `/comunidades/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/amenidades', async () => {
      const endpoint = `/comunidades/${comunidadId}/amenidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/edificios', async () => {
      const endpoint = `/comunidades/${comunidadId}/edificios`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/contactos', async () => {
      const endpoint = `/comunidades/${comunidadId}/contactos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/documentos', async () => {
      const endpoint = `/comunidades/${comunidadId}/documentos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/residentes', async () => {
      const endpoint = `/comunidades/${comunidadId}/residentes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/miembros', async () => {
      const endpoint = `/comunidades/${comunidadId}/miembros`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/parametros', async () => {
      const endpoint = `/comunidades/${comunidadId}/parametros`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/estadisticas', async () => {
      const endpoint = `/comunidades/${comunidadId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/flujo-caja', async () => {
      const endpoint = `/comunidades/${comunidadId}/flujo-caja`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /comunidades/verificar-acceso/:id', async () => {
      const endpoint = `/comunidades/verificar-acceso/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /comunidades/mis-membresias', async () => {
      const endpoint = `/comunidades/mis-membresias`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
