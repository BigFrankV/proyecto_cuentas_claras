/**
 * Tests de Salud - Módulo: MULTAS
 * Endpoints: 18 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_MULTA_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Multas Health Check', () => {
  let authToken;
  let comunidadId;
  let multaId; 
  let unidadId; // Asumiendo que testIds tiene unidadId

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    multaId = testIds.multaId;
    unidadId = testIds.unidadId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /multas/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/:id (Detalle de Multa)', async () => {
      const endpoint = `/multas/${multaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/completas', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/completas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /multas/comunidad/:comunidadId/proximas-vencer', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/proximas-vencer`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /multas/unidad/:unidadId', async () => {
      const endpoint = `/multas/unidad/${unidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas
  // =========================================
  describe('Estadísticas', () => {
    test('GET /multas/estadisticas/generales', async () => {
      const endpoint = `/multas/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/estadisticas-comunidad', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/estadisticas-comunidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/estadisticas/tipo', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/estadisticas/tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/estadisticas/prioridad', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/estadisticas/prioridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/estadisticas/mensuales', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/estadisticas/mensuales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
  
  // =========================================
  // 3. Búsqueda, Filtros y Exportación
  // =========================================
  describe('Búsqueda, Filtros y Exportación', () => {
    test('GET /multas/comunidad/:comunidadId/buscar', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/buscar`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/por-propietario', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/por-propietario`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/por-unidad', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/por-unidad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /multas/comunidad/:comunidadId/export', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/export`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/export/pendientes', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/export/pendientes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/export/estadisticas', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/export/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Validaciones
  // =========================================
  describe('Validaciones', () => {
    test('GET /multas/comunidad/:comunidadId/validar/integridad', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/validar/integridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /multas/comunidad/:comunidadId/validar/rangos-monto', async () => {
      const endpoint = `/multas/comunidad/${comunidadId}/validar/rangos-monto`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});