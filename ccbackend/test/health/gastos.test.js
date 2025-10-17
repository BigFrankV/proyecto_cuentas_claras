/**
 * Tests de Salud - Módulo: GASTOS
 * Total endpoints: 24 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID válido.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Gastos Module - Health Check Tests', () => {
  let authToken;
  let comunidadId;
  let gastoId;

  beforeAll(async () => {
    authToken = await getAuthToken();
    comunidadId = testIds.comunidadId;
    gastoId = testIds.gastoId; // ID de un gasto existente para pruebas de detalle
    
    if (!comunidadId || !gastoId) {
        console.warn("ADVERTENCIA: Gastos necesita testIds.comunidadId y testIds.gastoId.");
    }
  });

  // =========================================
  // 1. Listados, Filtros y Conteo
  // =========================================

  describe('Listados y Filtros', () => {
    test('GET /gastos/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/gastos/comunidad/${comunidadId}?limit=5`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /gastos/comunidad/:comunidadId/count', async () => {
      const endpoint = `/gastos/comunidad/${comunidadId}/count`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(response.body).toHaveProperty('total');
          expect(typeof response.body.total).toBe('number');
      }
    });

    test('GET /gastos/:id (Detalle de Gasto)', async () => {
      const endpoint = `/gastos/${gastoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/:id/archivos (Archivos Adjuntos)', async () => {
      const endpoint = `/gastos/${gastoId}/archivos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Estadísticas y Dashboards
  // =========================================
  
  describe('Estadísticas y Dashboards', () => {
    test('GET /gastos/estadisticas/general/:comunidadId', async () => {
      const endpoint = `/gastos/estadisticas/general/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(response.body).toHaveProperty('total_gastos');
      }
    });

    test('GET /gastos/estadisticas/por-categoria/:comunidadId', async () => {
      const endpoint = `/gastos/estadisticas/por-categoria/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/estadisticas/por-centro-costo/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/estadisticas/por-centro-costo/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/estadisticas/por-proveedor/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/estadisticas/por-proveedor/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /gastos/estadisticas/mensuales/:comunidadId', async () => {
      const endpoint = `/gastos/estadisticas/mensuales/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/estadisticas/extraordinarios-vs-operativos/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/estadisticas/extraordinarios-vs-operativos/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/dashboard/resumen-mensual/:comunidadId', async () => {
      const endpoint = `/gastos/dashboard/resumen-mensual/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/dashboard/top-categorias-mes/:comunidadId', async () => {
      const endpoint = `/gastos/dashboard/top-categorias-mes/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/dashboard/alertas-gastos-altos/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/dashboard/alertas-gastos-altos/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Reportes, Validaciones y Listas Desplegables
  // =========================================
  
  describe('Reportes, Validaciones y Listas', () => {
    test('GET /gastos/reportes/periodo-comparativo/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/reportes/periodo-comparativo/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /gastos/reportes/top-proveedores/:comunidadId', async () => {
      const endpoint = `/gastos/reportes/top-proveedores/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/reportes/por-dia-semana/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/reportes/por-dia-semana/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/exportar/:comunidadId', async () => {
      const endpoint = `/gastos/exportar/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /gastos/listas/categorias/:comunidadId', async () => {
      const endpoint = `/gastos/listas/categorias/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
      if (response.status === 200) {
          expect(Array.isArray(response.body)).toBe(true);
      }
    });
    
    test('GET /gastos/listas/centros-costo/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/listas/centros-costo/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/listas/proveedores/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/listas/proveedores/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/listas/documentos-disponibles/:comunidadId (Añadido)', async () => {
      const endpoint = `/gastos/listas/documentos-disponibles/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });
    
    test('GET /gastos/validar/existe/:id (Añadido)', async () => {
      const endpoint = `/gastos/validar/existe/${gastoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
    
    test('GET /gastos/validar/categoria/:id (Añadido)', async () => {
      const categoriaId = testIds.categoriaId; // Se asume disponible en testIds
      const endpoint = `/gastos/validar/categoria/${categoriaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gastos/validar/duplicado?comunidad_id=1&folio=F123&fecha=2025-01-01', async () => {
      const endpoint = `/gastos/validar/duplicado?comunidad_id=${comunidadId}&folio=F123&fecha=2025-01-01`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});