/**
 * Tests de Salud - Módulo: PRORRATEO
 * Endpoints: 9 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Prorrateo Health Check', () => {
  let authToken;
  let comunidadId = 1; // ID de comunidad de prueba
  let emisionId = 1; // ID de emisión de prueba
  let cuentaId = 1; // ID de cuenta de prueba

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Prorrateo', () => {
    test('GET /prorrateo/emisiones/:comunidadId (Emisiones por Comunidad)', async () => {
      const endpoint = `/prorrateo/emisiones/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(`GET /prorrateo/emisiones/${comunidadId}`, response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /prorrateo/emision/:emisionId/detalles (Detalles de Emisión)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/detalles`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/emision/${emisionId}/detalles`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /prorrateo/emision/:emisionId/cuentas (Cuentas de Emisión)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/cuentas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/emision/${emisionId}/cuentas`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('Información Adicional de Prorrateo', () => {
    test('GET /prorrateo/cuenta/:cuentaId/detalles (Detalles de Cuenta)', async () => {
      const endpoint = `/prorrateo/cuenta/${cuentaId}/detalles`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/cuenta/${cuentaId}/detalles`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /prorrateo/emision/:emisionId/pagos (Pagos de Emisión)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(`GET /prorrateo/emision/${emisionId}/pagos`, response);
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /prorrateo/emision/:emisionId/resumen (Resumen de Emisión)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/resumen`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/emision/${emisionId}/resumen`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('Estadísticas y Configuración de Prorrateo', () => {
    test('GET /prorrateo/emision/:emisionId/conceptos (Conceptos de Emisión)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/conceptos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/emision/${emisionId}/conceptos`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /prorrateo/emision/:emisionId/unidades (Unidades de Emisión)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/emision/${emisionId}/unidades`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('GET /prorrateo/emision/:emisionId/conceptos-detallados (Conceptos Detallados)', async () => {
      const endpoint = `/prorrateo/emision/${emisionId}/conceptos-detallados`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(
        `GET /prorrateo/emision/${emisionId}/conceptos-detallados`,
        response
      );
      expect([200, 401, 403, 404]).toContain(response.status);
    });
  });
});
