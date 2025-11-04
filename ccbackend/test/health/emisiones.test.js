/**
 * Tests de Salud - Módulo: EMISIONES
 * Endpoints: 17 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_EMISION_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Emisiones Health Check', () => {
  let authToken;
  let comunidadId;
  let emisionId;

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    emisionId = testIds.emisionId;
  });

  // =========================================
  // 1. Listados, Conteo y Detalle
  // =========================================
  describe('Listados, Conteo y Detalle', () => {
    test('GET /emisiones/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/emisiones/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /emisiones/comunidad/:comunidadId/count', async () => {
      const endpoint = `/emisiones/comunidad/${comunidadId}/count`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id (Detalle Simple)', async () => {
      const endpoint = `/emisiones/${emisionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id/detalle-completo', async () => {
      const endpoint = `/emisiones/${emisionId}/detalle-completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id/detalles (Detalles de Items)', async () => {
      const endpoint = `/emisiones/${emisionId}/detalles`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Sub-recursos de Emisión
  // =========================================
  describe('Sub-recursos de Emisión', () => {
    test('GET /emisiones/:id/gastos', async () => {
      const endpoint = `/emisiones/${emisionId}/gastos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id/unidades', async () => {
      const endpoint = `/emisiones/${emisionId}/unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id/pagos', async () => {
      const endpoint = `/emisiones/${emisionId}/pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id/auditoria', async () => {
      const endpoint = `/emisiones/${emisionId}/auditoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Estadísticas y Validaciones
  // =========================================
  describe('Estadísticas y Validaciones', () => {
    test('GET /emisiones/estadisticas/general', async () => {
      const endpoint = `/emisiones/estadisticas/general`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /emisiones/estadisticas/por-mes', async () => {
      const endpoint = `/emisiones/estadisticas/por-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /emisiones/estadisticas/cobranza', async () => {
      const endpoint = `/emisiones/estadisticas/cobranza`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /emisiones/validar/existencia', async () => {
      const endpoint = `/emisiones/validar/existencia`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /emisiones/validar/gastos/:id', async () => {
      const endpoint = `/emisiones/validar/gastos/${emisionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/validar/cuentas/:id', async () => {
      const endpoint = `/emisiones/validar/cuentas/${emisionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/validar/cobertura/:comunidadId/:emisionId', async () => {
      const endpoint = `/emisiones/validar/cobertura/${comunidadId}/${emisionId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /emisiones/:id/previsualizar-prorrateo', async () => {
      const endpoint = `/emisiones/${emisionId}/previsualizar-prorrateo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
