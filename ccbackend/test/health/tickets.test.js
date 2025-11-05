/**
 * Tests de Salud - Módulo: TICKETS
 * Endpoints: 16 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_TICKET_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Tickets Health Check', () => {
  let authToken;
  let comunidadId;
  let ticketId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    ticketId = testIds.ticketId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /tickets/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/tickets/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /tickets/:id (Detalle de Ticket)', async () => {
      const endpoint = `/tickets/${ticketId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /tickets/todos/completos', async () => {
      const endpoint = `/tickets/todos/completos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/comunidad/:comunidadId/proximos-vencer', async () => {
      const endpoint = `/tickets/comunidad/${comunidadId}/proximos-vencer`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas
  // =========================================
  describe('Estadísticas', () => {
    test('GET /tickets/estadisticas/generales', async () => {
      const endpoint = `/tickets/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/estadisticas/por-estado', async () => {
      const endpoint = `/tickets/estadisticas/por-estado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/estadisticas/por-prioridad', async () => {
      const endpoint = `/tickets/estadisticas/por-prioridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/estadisticas/por-categoria', async () => {
      const endpoint = `/tickets/estadisticas/por-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/estadisticas/mensuales', async () => {
      const endpoint = `/tickets/estadisticas/mensuales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/por-asignado/estadisticas', async () => {
      const endpoint = `/tickets/por-asignado/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Búsqueda, Exportación y Validaciones
  // =========================================
  describe('Búsqueda, Exportación y Validaciones', () => {
    test('GET /tickets/busqueda/avanzada', async () => {
      const endpoint = `/tickets/busqueda/avanzada`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/export/completo', async () => {
      const endpoint = `/tickets/export/completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/export/abiertos', async () => {
      const endpoint = `/tickets/export/abiertos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/export/estadisticas-resolucion', async () => {
      const endpoint = `/tickets/export/estadisticas-resolucion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tickets/validacion/integridad', async () => {
      const endpoint = `/tickets/validacion/integridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});
