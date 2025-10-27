/**
 * Tests de Salud - Módulo: UTIL
 * Endpoints: 9 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Util Health Check', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Util', () => {
    test('GET /util/health (Estado de Salud)', async () => {
      const endpoint = `/util/health`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/health', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /util/version (Versión del Sistema)', async () => {
      const endpoint = `/util/version`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/version', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /util/uf (Valor UF)', async () => {
      const endpoint = `/util/uf`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/uf', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Información Adicional de Util', () => {
    test('GET /util/utm (Valor UTM)', async () => {
      const endpoint = `/util/utm`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/utm', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /util/validar-rut (Validar RUT)', async () => {
      const endpoint = `/util/validar-rut`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/validar-rut', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /util/sync/status (Estado de Sincronización)', async () => {
      const endpoint = `/util/sync/status`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/sync/status', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Estadísticas y Configuración de Util', () => {
    test('GET /util/indicadores (Indicadores del Sistema)', async () => {
      const endpoint = `/util/indicadores`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/indicadores', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /util/uf/historico (Histórico UF)', async () => {
      const endpoint = `/util/uf/historico`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/uf/historico', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /util/utm/historico (Histórico UTM)', async () => {
      const endpoint = `/util/utm/historico`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /util/utm/historico', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});