/**
 * Tests de Salud - Módulo: VALOR UTM (Indicadores)
 * Total endpoints: ~18
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Valor UTM Health Check', () => {
  let authToken;
  const currentYear = new Date().getFullYear();
  const testMonth = 10; 
  const testYear = 2024; // Ajustar a un año con datos en BD de prueba

  beforeAll(() => {
    authToken = getAuthToken();
  });

  describe('Consultas Básicas y Rango', () => {
    test('GET /valor-utm/actual', async () => {
      const endpoint = `/valor-utm/actual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/periodo/:mes/:ano', async () => {
      const endpoint = `/valor-utm/periodo/${testMonth}/${testYear}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/rango?meses=3', async () => {
      const endpoint = `/valor-utm/rango?meses=3`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe('Histórico Anual', () => {
    test('GET /valor-utm/historico/:ano', async () => {
      const endpoint = `/valor-utm/historico/${currentYear - 1}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /valor-utm/resumen-anual/:ano', async () => {
      const endpoint = `/valor-utm/resumen-anual/${currentYear - 1}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/resumen-anos', async () => {
      const endpoint = `/valor-utm/resumen-anos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe('Variaciones y Tendencias', () => {
    test('GET /valor-utm/variacion-mensual?meses=3', async () => {
      const endpoint = `/valor-utm/variacion-mensual?meses=3`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /valor-utm/variacion-interanual/:ano', async () => {
      const endpoint = `/valor-utm/variacion-interanual/${currentYear}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /valor-utm/trimestral', async () => {
      const endpoint = `/valor-utm/trimestral`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /valor-utm/semestral?desde=2023', async () => {
      const endpoint = `/valor-utm/semestral?desde=${currentYear - 2}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /valor-utm/comparacion-anos', async () => {
      const endpoint = `/valor-utm/comparacion-anos?anos=${currentYear},${currentYear - 1}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  describe('Conversiones y Dashboard', () => {
    test('GET /valor-utm/conversion/tabla', async () => {
      const endpoint = `/valor-utm/conversion/tabla`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/conversion/pesos-a-utm?pesos=100000', async () => {
      const endpoint = `/valor-utm/conversion/pesos-a-utm?pesos=100000`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /valor-utm/conversion/utm-a-pesos?utm=2.5', async () => {
      const endpoint = `/valor-utm/conversion/utm-a-pesos?utm=2.5`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /valor-utm/dashboard', async () => {
      const endpoint = `/valor-utm/dashboard`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /valor-utm/disponibilidad', async () => {
      const endpoint = `/valor-utm/disponibilidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});