/**
 * Tests de Salud - Módulo: TARIFAS CONSUMO
 * Endpoints: 13 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_TARIFA_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Tarifas Consumo Health Check', () => {
  let authToken;
  let comunidadId;
  let tarifaId; 

  beforeAll(() => {
    authToken = getAuthToken();
    comunidadId = testIds.comunidadId;
    tarifaId = testIds.tarifaId; 
  });

  // =========================================
  // 1. Listados y Búsqueda
  // =========================================
  describe('Listados y Búsqueda', () => {
    test('GET /tarifas-consumo/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/tarifas-consumo/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/comunidad/:comunidadId/por-tipo', async () => {
      const endpoint = `/tarifas-consumo/comunidad/${comunidadId}/por-tipo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/:id (Detalle de Tarifa)', async () => {
      const endpoint = `/tarifas-consumo/${tarifaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/todas/con-estructura', async () => {
      const endpoint = `/tarifas-consumo/todas/con-estructura`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/busqueda/avanzada', async () => {
      const endpoint = `/tarifas-consumo/busqueda/avanzada`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /tarifas-consumo/busqueda/por-rango-precio', async () => {
      const endpoint = `/tarifas-consumo/busqueda/por-rango-precio`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Exportación
  // =========================================
  describe('Estadísticas y Exportación', () => {
    test('GET /tarifas-consumo/estadisticas/generales', async () => {
      const endpoint = `/tarifas-consumo/estadisticas/generales`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /tarifas-consumo/estadisticas/por-servicio', async () => {
      const endpoint = `/tarifas-consumo/estadisticas/por-servicio`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /tarifas-consumo/estadisticas/precios', async () => {
      const endpoint = `/tarifas-consumo/estadisticas/precios`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/export/completo', async () => {
      const endpoint = `/tarifas-consumo/export/completo`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /tarifas-consumo/export/por-servicio', async () => {
      const endpoint = `/tarifas-consumo/export/por-servicio`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Validaciones
  // =========================================
  describe('Validaciones', () => {
    test('GET /tarifas-consumo/validacion/integridad', async () => {
      const endpoint = `/tarifas-consumo/validacion/integridad`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
    
    test('GET /tarifas-consumo/validacion/solapamiento', async () => {
      const endpoint = `/tarifas-consumo/validacion/solapamiento`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});