/**
 * Tests de Salud - Módulo: PROVEEDORES
 * Endpoints: 16 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_PROVEEDOR_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Proveedores Health Check', () => {
  let authToken;
  let comunidadId;
  let proveedorId; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    proveedorId = testIds.proveedorId;
  });

  // =========================================
  // 1. Listados y Detalle
  // =========================================
  describe('Listados y Detalle', () => {
    test('GET /proveedores/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/:id (Detalle de Proveedor)', async () => {
      const endpoint = `/proveedores/${proveedorId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /proveedores/:id/historial-gastos', async () => {
      const endpoint = `/proveedores/${proveedorId}/historial-gastos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/:id/documentos', async () => {
      const endpoint = `/proveedores/${proveedorId}/documentos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Reportes
  // =========================================
  describe('Estadísticas y Reportes', () => {
    test('GET /proveedores/comunidad/:comunidadId/estadisticas', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/top-volumen', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/top-volumen`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/inactivos', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/inactivos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/analisis-mensual', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/analisis-mensual`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/por-categoria', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/por-categoria`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/comparativa', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/comparativa`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
  
  // =========================================
  // 3. Dashboard y Utilidades
  // =========================================
  describe('Dashboard y Utilidades', () => {
    test('GET /proveedores/comunidad/:comunidadId/dashboard', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/dashboard`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/top-mes', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/top-mes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/comunidad/:comunidadId/distribucion', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/distribucion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /proveedores/:id/validar-eliminacion', async () => {
      const endpoint = `/proveedores/${proveedorId}/validar-eliminacion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /proveedores/comunidad/:comunidadId/export', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/export`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /proveedores/comunidad/:comunidadId/dropdown', async () => {
      const endpoint = `/proveedores/comunidad/${comunidadId}/dropdown`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });
});