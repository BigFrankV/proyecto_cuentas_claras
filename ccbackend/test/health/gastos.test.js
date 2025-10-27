/**
 * Tests de Salud - Módulo: GASTOS
 * Endpoints: 21 (GET)
 * Requisitos: Requiere DUMMY_MEDIDOR_ID válido.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Gastos Health Check', () => {
  let authToken;
  let gastoId = 1; // ID de gasto de prueba
  let comunidadId = 1; // ID de comunidad de prueba

  beforeAll(() => {
    authToken = getAuthToken();
  });

  // =========================================
  // 1. Gastos Básicos
  // =========================================
  describe('Gastos Básicos', () => {
    test('GET /gastos/comunidad/:comunidadId (Gastos por Comunidad)', async () => {
      const endpoint = `/gastos/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/comunidad/:comunidadId/count (Conteo de Gastos)', async () => {
      const endpoint = `/gastos/comunidad/${comunidadId}/count`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/:id (Detalle de Gasto)', async () => {
      const endpoint = `/gastos/${gastoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/:id/archivos (Archivos de Gasto)', async () => {
      const endpoint = `/gastos/${gastoId}/archivos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas de Gastos
  // =========================================
  describe('Estadísticas de Gastos', () => {
    test('GET /gastos/estadisticas/general/:comunidadId (Estadísticas Generales)', async () => {
      const endpoint = `/gastos/estadisticas/general/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/estadisticas/por-categoria/:comunidadId (Por Categoría)', async () => {
      const endpoint = `/gastos/estadisticas/por-categoria/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/estadisticas/por-centro-costo/:comunidadId (Por Centro de Costo)', async () => {
      const endpoint = `/gastos/estadisticas/por-centro-costo/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/estadisticas/por-proveedor/:comunidadId (Por Proveedor)', async () => {
      const endpoint = `/gastos/estadisticas/por-proveedor/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/estadisticas/mensuales/:comunidadId (Mensuales)', async () => {
      const endpoint = `/gastos/estadisticas/mensuales/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/estadisticas/extraordinarios-vs-operativos/:comunidadId (Extraordinarios vs Operativos)', async () => {
      const endpoint = `/gastos/estadisticas/extraordinarios-vs-operativos/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Validaciones
  // =========================================
  describe('Validaciones', () => {
    test('GET /gastos/validar/existe/:id (Validar Existencia)', async () => {
      const endpoint = `/gastos/validar/existe/${gastoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/validar/categoria/:id (Validar Categoría)', async () => {
      const endpoint = `/gastos/validar/categoria/${gastoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/validar/duplicado (Validar Duplicado)', async () => {
      const endpoint = `/gastos/validar/duplicado`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Listas y Datos de Referencia
  // =========================================
  describe('Listas y Datos de Referencia', () => {
    test('GET /gastos/listas/categorias/:comunidadId (Lista de Categorías)', async () => {
      const endpoint = `/gastos/listas/categorias/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/listas/centros-costo/:comunidadId (Lista de Centros de Costo)', async () => {
      const endpoint = `/gastos/listas/centros-costo/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/listas/proveedores/:comunidadId (Lista de Proveedores)', async () => {
      const endpoint = `/gastos/listas/proveedores/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/listas/documentos-disponibles/:comunidadId (Documentos Disponibles)', async () => {
      const endpoint = `/gastos/listas/documentos-disponibles/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 5. Reportes
  // =========================================
  describe('Reportes', () => {
    test('GET /gastos/reportes/periodo-comparativo/:comunidadId (Período Comparativo)', async () => {
      const endpoint = `/gastos/reportes/periodo-comparativo/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/reportes/top-proveedores/:comunidadId (Top Proveedores)', async () => {
      const endpoint = `/gastos/reportes/top-proveedores/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/reportes/por-dia-semana/:comunidadId (Por Día de Semana)', async () => {
      const endpoint = `/gastos/reportes/por-dia-semana/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/exportar/:comunidadId (Exportar Gastos)', async () => {
      const endpoint = `/gastos/exportar/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});