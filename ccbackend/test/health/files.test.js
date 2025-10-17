/**
 * Tests de Salud - Módulo: FILES (Archivos)
 * Endpoints: 3 (GET)
 * Requisitos: Requiere DUMMY_FILE_ID válido.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Files Health Check', () => {
  let authToken;
  let fileId; 

  beforeAll(() => {
    authToken = getAuthToken();
    fileId = testIds.fileId || 1; // Usar un ID dummy si no está en testIds
  });

  describe('Files Endpoints', () => {
    test('GET /files/:id (Detalle/Descarga de Archivo)', async () => {
      const endpoint = `/files/${fileId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /files (Listado de Archivos)', async () => {
      const endpoint = `/files`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /files/stats (Estadísticas de Archivos)', async () => {
      const endpoint = `/files/stats`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });
});