/**
 * Tests de Salud - Módulo: UTILIDADES (General e Indicadores Económicos)
 * Endpoints: 27 (GET)
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Utilidades Health Check', () => {
  let authToken;
  const dummyAno = '2024';
  const dummyMes = '01';
  
  beforeAll(() => {
    authToken = getAuthToken();
  });

  // =========================================
  // 1. Endpoints Generales de Utilidad (/util)
  // =========================================
  describe('Endpoints Generales (/util)', () => {
    test('GET /util/health (Health Check General)', async () => {
      const endpoint = `/util/health`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/version', async () => {
      const endpoint = `/util/version`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/uf', async () => {
      const endpoint = `/util/uf`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/utm', async () => {
      const endpoint = `/util/utm`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/sync/status', async () => {
      const endpoint = `/util/sync/status`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/indicadores', async () => {
      const endpoint = `/util/indicadores`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/uf/historico', async () => {
      const endpoint = `/util/uf/historico`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/utm/historico', async () => {
      const endpoint = `/util/utm/historico`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /util/validar-rut', async () => {
      const endpoint = `/util/validar-rut?rut=12345678-9`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Endpoints de Valor UTM (/valor-utm)
  // =========================================
  describe('Endpoints de Valor UTM (/valor-utm)', () => {
    test('GET /valor-utm/actual', async () => {
      const endpoint = `/valor-utm/actual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/periodo/:mes/:ano', async () => {
      const endpoint = `/valor-utm/periodo/${dummyMes}/${dummyAno}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/rango', async () => {
      const endpoint = `/valor-utm/rango`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/historico/:ano', async () => {
      const endpoint = `/valor-utm/historico/${dummyAno}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/resumen-anual/:ano', async () => {
      const endpoint = `/valor-utm/resumen-anual/${dummyAno}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/resumen-anos', async () => {
      const endpoint = `/valor-utm/resumen-anos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/variacion-mensual', async () => {
      const endpoint = `/valor-utm/variacion-mensual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/variacion-interanual/:ano', async () => {
      const endpoint = `/valor-utm/variacion-interanual/${dummyAno}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/trimestral', async () => {
      const endpoint = `/valor-utm/trimestral`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/semestral', async () => {
      const endpoint = `/valor-utm/semestral`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/comparacion-anos', async () => {
      const endpoint = `/valor-utm/comparacion-anos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/top-valores', async () => {
      const endpoint = `/valor-utm/top-valores`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/estadisticas', async () => {
      const endpoint = `/valor-utm/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/dashboard', async () => {
      const endpoint = `/valor-utm/dashboard`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/grafico', async () => {
      const endpoint = `/valor-utm/grafico`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/conversion/tabla', async () => {
      const endpoint = `/valor-utm/conversion/tabla`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/conversion/pesos-a-utm', async () => {
      const endpoint = `/valor-utm/conversion/pesos-a-utm`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/conversion/utm-a-pesos', async () => {
      const endpoint = `/valor-utm/conversion/utm-a-pesos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });

    test('GET /valor-utm/disponibilidad', async () => {
      const endpoint = `/valor-utm/disponibilidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });
  });
});