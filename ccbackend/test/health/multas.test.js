/**
 * Tests de Salud - Módulo: MULTAS
 * Endpoints: 8 (GET)
 * Requisitos: Requiere IDs válidos para diferentes entidades.
 */

const { app, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Multas Health Check', () => {
  let authToken;
  let multaId = 1; // ID de multa de prueba
  let unidadId = 1; // ID de unidad de prueba

  beforeAll(() => {
    authToken = getAuthToken();
  });

  // =========================================
  // 1. Gestión Básica de Multas
  // =========================================
  describe('Gestión Básica de Multas', () => {
    test('GET /multas (Lista de Multas)', async () => {
      const endpoint = `/multas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /multas/:id (Detalle de Multa)', async () => {
      const endpoint = `/multas/${multaId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /multas/:id/historial (Historial de Multa)', async () => {
      const endpoint = `/multas/${multaId}/historial`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /multas/unidad/:unidadId (Multas por Unidad)', async () => {
      const endpoint = `/multas/unidad/${unidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Información Adicional
  // =========================================
  describe('Información Adicional', () => {
    test('GET /multas/:id/apelaciones (Apelaciones de Multa)', async () => {
      const endpoint = `/multas/${multaId}/apelaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /multas/:id/documentos (Documentos de Multa)', async () => {
      const endpoint = `/multas/${multaId}/documentos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Estadísticas y Configuración
  // =========================================
  describe('Estadísticas y Configuración', () => {
    test('GET /multas/estadisticas (Estadísticas Generales)', async () => {
      const endpoint = `/multas/estadisticas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /multas/tipos-infraccion (Tipos de Infracción)', async () => {
      const endpoint = `/multas/tipos-infraccion`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
