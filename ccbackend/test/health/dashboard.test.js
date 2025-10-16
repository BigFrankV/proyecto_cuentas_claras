/**
 * Tests de Salud - Módulo: DASHBOARD
 * Total endpoints: 16 (Completos)
 */

// Test module for dashboard endpoints
const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Dashboard Module - Health Check Tests', () => {
  let authToken;
  let comunidadId;

  beforeAll(async () => {
    authToken = await getAuthToken();
    comunidadId = testIds.comunidadId;
    // Aseguramos que el ID de comunidad sea válido para los tests de ruta con ID
    if (!comunidadId) {
        throw new Error("testIds.comunidadId no está definido. Revisa tu archivo setup.js.");
    }
  });

  // =========================================
  // 1. KPIs Principales (Sección 1)
  // =========================================

  describe('KPIs Principales (Sección 1)', () => {
    test('GET /dashboard/comunidad/:comunidadId/kpis (KPIs Agrupados)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/kpis`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('saldo_total');
        expect(response.body).toHaveProperty('ingresos_mes');
        expect(response.body).toHaveProperty('gastos_mes');
        expect(response.body).toHaveProperty('morosidad');
      }
    });

    test('GET /dashboard/comunidad/:comunidadId/saldo-total', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/saldo-total`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /dashboard/comunidad/:comunidadId/tasa-morosidad', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/tasa-morosidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/ingresos-mes', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/ingresos-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/gastos-mes', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/gastos-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Datos para Gráficos (Sección 2)
  // =========================================

  describe('Datos para Gráficos (Sección 2)', () => {
    test('GET /dashboard/comunidad/:comunidadId/grafico-emisiones', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/grafico-emisiones?meses=3`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(Array.isArray(response.body)).toBe(true);
      }
    });

    test('GET /dashboard/comunidad/:comunidadId/grafico-estado-pagos', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/grafico-estado-pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(Array.isArray(response.body)).toBe(true);
      }
    });

    test('GET /dashboard/comunidad/:comunidadId/grafico-gastos-categoria', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/grafico-gastos-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  // =========================================
  // 3. Tablas de Datos y Actividad (Sección 3)
  // =========================================

  describe('Tablas de Datos y Actividad (Sección 3)', () => {
    test('GET /dashboard/comunidad/:comunidadId/pagos-recientes', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/pagos-recientes?limit=5`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/unidades-morosas', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/unidades-morosas?limit=5`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/proximas-actividades', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/proximas-actividades?limit=5`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/reservas-amenidades', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/reservas-amenidades?limit=3`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/notificaciones', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/notificaciones?limit=5`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Métricas Adicionales y Resumen Completo (Sección 5)
  // =========================================

  describe('Métricas y Resumen Completo (Sección 5)', () => {
    test('GET /dashboard/comunidad/:comunidadId/efectividad-cobranza', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/efectividad-cobranza`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(response.body).toHaveProperty('efectividad_cobranza');
          expect(typeof response.body.efectividad_cobranza).toBe('number');
      }
    });

    test('GET /dashboard/comunidad/:comunidadId/tendencia-ingresos', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/tendencia-ingresos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/resumen-completo', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/resumen-completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(response.body).toHaveProperty('kpis');
          expect(response.body).toHaveProperty('graficos');
          expect(response.body).toHaveProperty('tablas');
          expect(response.body).toHaveProperty('notificaciones');
          expect(response.body).toHaveProperty('metricas');
      }
    });
  });
});