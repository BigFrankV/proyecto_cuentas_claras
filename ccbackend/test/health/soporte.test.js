/**
 * Tests de Salud - Módulo: SOPORTE
 * Endpoints: 6 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_TICKET_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Soporte Health Check', () => {
  let authToken;
  let comunidadId;
  let ticketId; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    ticketId = testIds.ticketId; 
  });

  describe('Soporte Endpoints', () => {
    test('GET /soporte/comunidad/:comunidadId/tickets (Listado de Tickets)', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/tickets`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /soporte/tickets/:id (Detalle de Ticket)', async () => {
      const endpoint = `/soporte/tickets/${ticketId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/notificaciones', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/notificaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/documentos', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/documentos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/bitacora', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/bitacora`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/parametros-cobranza', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/parametros-cobranza`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});