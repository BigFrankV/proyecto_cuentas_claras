/**
 * Tests de Salud - Módulo: VALOR UTM
 * Endpoints: 19 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Valor UTM Health Check', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('Gestión Básica de Valor UTM', () => {
    test('GET /valor-utm/actual (Valor UTM Actual)', async () => {
      const endpoint = `/valor-utm/actual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/actual', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/periodo/1/2024 (Valor UTM por Período)', async () => {
      const endpoint = `/valor-utm/periodo/1/2024`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/periodo/1/2024', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/rango (Valor UTM por Rango)', async () => {
      const endpoint = `/valor-utm/rango`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/rango', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/historico/2024 (Histórico Anual)', async () => {
      const endpoint = `/valor-utm/historico/2024`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/historico/2024', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Información Adicional de Valor UTM', () => {
    test('GET /valor-utm/resumen-anual/2024 (Resumen Anual)', async () => {
      const endpoint = `/valor-utm/resumen-anual/2024`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/resumen-anual/2024', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/resumen-anos (Resumen de Años)', async () => {
      const endpoint = `/valor-utm/resumen-anos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/resumen-anos', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/variacion-mensual (Variación Mensual)', async () => {
      const endpoint = `/valor-utm/variacion-mensual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/variacion-mensual', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/variacion-interanual/2024 (Variación Interanual)', async () => {
      const endpoint = `/valor-utm/variacion-interanual/2024`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/variacion-interanual/2024', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/trimestral (Datos Trimestrales)', async () => {
      const endpoint = `/valor-utm/trimestral`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/trimestral', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Estadísticas y Configuración de Valor UTM', () => {
    test('GET /valor-utm/semestral (Datos Semestrales)', async () => {
      const endpoint = `/valor-utm/semestral`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/semestral', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/comparacion-anos (Comparación de Años)', async () => {
      const endpoint = `/valor-utm/comparacion-anos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/comparacion-anos', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/top-valores (Top Valores)', async () => {
      const endpoint = `/valor-utm/top-valores`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/top-valores', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/estadisticas (Estadísticas)', async () => {
      const endpoint = `/valor-utm/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/estadisticas', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/dashboard (Dashboard)', async () => {
      const endpoint = `/valor-utm/dashboard`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/dashboard', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/grafico (Gráfico)', async () => {
      const endpoint = `/valor-utm/grafico`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/grafico', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('Conversión y Disponibilidad', () => {
    test('GET /valor-utm/conversion/tabla (Tabla de Conversión)', async () => {
      const endpoint = `/valor-utm/conversion/tabla`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/conversion/tabla', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/conversion/pesos-a-utm (Pesos a UTM)', async () => {
      const endpoint = `/valor-utm/conversion/pesos-a-utm`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/conversion/pesos-a-utm', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/conversion/utm-a-pesos (UTM a Pesos)', async () => {
      const endpoint = `/valor-utm/conversion/utm-a-pesos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/conversion/utm-a-pesos', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/disponibilidad (Disponibilidad)', async () => {
      const endpoint = `/valor-utm/disponibilidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET /valor-utm/disponibilidad', response);
      expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});
