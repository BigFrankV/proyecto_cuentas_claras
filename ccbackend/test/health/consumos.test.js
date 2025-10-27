/**
 * Tests de Salud - Módulo: CONSUMOS
 * Endpoints: 5 (GET)
 * Requisitos: Requiere DUMMY_MEDIDOR_ID válido.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Consumos Health Check', () => {
  let authToken;
  let medidorId;

  beforeAll(() => {
    authToken = getAuthToken();
    medidorId = testIds.medidorId;
  });

  // =========================================
  // 1. Tendencias y Análisis
  // =========================================
  describe('Tendencias y Análisis', () => {
    test('GET /consumos/mensual (Tendencia Mensual)', async () => {
      const endpoint = `/consumos/mensual?medidor_id=${medidorId}&periodo_inicio=2024-01&periodo_fin=2024-12`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /consumos/trimestral (Tendencia Trimestral)', async () => {
      const endpoint = `/consumos/trimestral?medidor_id=${medidorId}&periodo_inicio=2024-01&periodo_fin=2024-12`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /consumos/semanal (Tendencia Semanal)', async () => {
      const endpoint = `/consumos/semanal?medidor_id=${medidorId}&periodo_inicio=2024-01&periodo_fin=2024-12`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Detalles
  // =========================================
  describe('Estadísticas y Detalles', () => {
    test('GET /consumos/estadisticas (Estadísticas Generales)', async () => {
      const endpoint = `/consumos/estadisticas?medidor_id=${medidorId}&periodo_inicio=2024-01&periodo_fin=2024-12`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /consumos/detalle (Detalle por Período)', async () => {
      const endpoint = `/consumos/detalle?medidor_id=${medidorId}&periodo_inicio=2024-01&periodo_fin=2024-12`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});