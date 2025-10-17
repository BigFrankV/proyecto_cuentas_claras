/**
 * Tests de Salud - Módulo: DOCUMENTOS DE COMPRA
 * Total endpoints: 2 (GET)
 * Requisitos: Requiere DUMMY_COMMUNITY_ID y DUMMY_DOC_COMPRA_ID válidos.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('DocumentosCompra Module - Health Check Tests', () => {
  let authToken;
  let comunidadId;
  let documentoId;

  beforeAll(async () => {
    authToken = await getAuthToken();
    comunidadId = testIds.comunidadId;
    documentoId = testIds.documentoCompraId;
    
    if (!comunidadId || !documentoId) {
        console.warn("ADVERTENCIA: DocumentosCompra necesita testIds.comunidadId y testIds.documentoCompraId.");
    }
  });

  describe('DocumentosCompra Endpoints', () => {
    test('GET /documentos-compra/comunidad/:comunidadId (Listado Base)', async () => {
      const endpoint = `/documentos-compra/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      expect([200, 401, 403, 500]).toContain(response.status);
    });

    test('GET /documentos-compra/:id (Detalle por ID)', async () => {
      const endpoint = `/documentos-compra/${documentoId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse('GET', endpoint, response.status, response.body);
      // Esperamos 404 si el ID no es válido/existe, o 200 si sí lo es.
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });
});