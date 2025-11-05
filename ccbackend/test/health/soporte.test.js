/**
 * Tests de Salud - Módulo: SOPORTE
 * Endpoints: 6 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Soporte Health Check', () => {
  let authToken;
  let comunidadId = 1; // ID de comunidad de prueba
  let ticketId = 1; // ID de ticket de prueba

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Soporte', () => {
    test('GET /soporte/comunidad/:comunidadId/tickets (Tickets por Comunidad)', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/tickets`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /soporte/comunidad/${comunidadId}/tickets`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /soporte/tickets/:id (Detalle de Ticket)', async () => {
      const endpoint = `/soporte/tickets/${ticketId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(`GET /soporte/tickets/${ticketId}`, response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('Información Adicional de Soporte', () => {
    test('GET /soporte/comunidad/:comunidadId/notificaciones (Notificaciones por Comunidad)', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/notificaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /soporte/comunidad/${comunidadId}/notificaciones`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/documentos (Documentos por Comunidad)', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/documentos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /soporte/comunidad/${comunidadId}/documentos`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/bitacora (Bitácora por Comunidad)', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/bitacora`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /soporte/comunidad/${comunidadId}/bitacora`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /soporte/comunidad/:comunidadId/parametros-cobranza (Parámetros de Cobranza)', async () => {
      const endpoint = `/soporte/comunidad/${comunidadId}/parametros-cobranza`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /soporte/comunidad/${comunidadId}/parametros-cobranza`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});
