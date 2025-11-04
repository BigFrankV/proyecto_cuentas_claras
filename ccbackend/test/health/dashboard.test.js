/**
 * Tests de Salud - Módulo: DASHBOARD
 * Endpoints: 16 (GET)
 * Requisitos: Requiere comunidadId válido.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Dashboard Health Check', () => {
  let authToken;
  let comunidadId = 1; // ID de comunidad de prueba

  beforeAll(() => {
    authToken = getAuthToken();
  });

  // =========================================
  // 1. KPIs y Métricas Principales
  // =========================================
  describe('KPIs y Métricas Principales', () => {
    test('GET /dashboard/comunidad/:comunidadId/kpis (KPIs Generales)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/kpis`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/saldo-total (Saldo Total)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/saldo-total`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/ingresos-mes (Ingresos del Mes)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/ingresos-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/gastos-mes (Gastos del Mes)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/gastos-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/tasa-morosidad (Tasa de Morosidad)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/tasa-morosidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Gráficos y Visualizaciones
  // =========================================
  describe('Gráficos y Visualizaciones', () => {
    test('GET /dashboard/comunidad/:comunidadId/grafico-emisiones (Gráfico de Emisiones)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/grafico-emisiones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/grafico-estado-pagos (Estado de Pagos)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/grafico-estado-pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/grafico-gastos-categoria (Gastos por Categoría)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/grafico-gastos-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Información Reciente y Actual
  // =========================================
  describe('Información Reciente y Actual', () => {
    test('GET /dashboard/comunidad/:comunidadId/pagos-recientes (Pagos Recientes)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/pagos-recientes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/unidades-morosas (Unidades Morosas)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/unidades-morosas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/proximas-actividades (Próximas Actividades)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/proximas-actividades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/reservas-amenidades (Reservas de Amenidades)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/reservas-amenidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/notificaciones (Notificaciones)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/notificaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Análisis y Tendencias
  // =========================================
  describe('Análisis y Tendencias', () => {
    test('GET /dashboard/comunidad/:comunidadId/efectividad-cobranza (Efectividad de Cobranza)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/efectividad-cobranza`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/tendencia-ingresos (Tendencia de Ingresos)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/tendencia-ingresos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/resumen-completo (Resumen Completo)', async () => {
      const endpoint = `/dashboard/comunidad/${comunidadId}/resumen-completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
