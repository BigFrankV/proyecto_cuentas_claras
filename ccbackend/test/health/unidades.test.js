/**
 * Tests de Salud - Módulo: UNIDADES
 * Endpoints: 21 (GET)
 * Requisitos: Requiere DUMMY_MEDIDOR_ID válido.
 */

const { app, testIds, getAuthToken } = require('./setup');
const { categorizeResponse, getWithAuth } = require('./helpers');

describe('Unidades Health Check', () => {
  let authToken;
  let medidorId;
  let unidadId = 1; // ID de unidad de prueba
  let cuentaId = 1; // ID de cuenta de prueba
  let comunidadId = 1; // ID de comunidad de prueba
  let edificioId = 1; // ID de edificio de prueba
  let torreId = 1; // ID de torre de prueba

  beforeAll(() => {
    authToken = getAuthToken();
    medidorId = testIds.medidorId;
  });

  // =========================================
  // 1. Información Básica de Unidades
  // =========================================
  describe('Información Básica de Unidades', () => {
    test('GET /unidades/comunidad/:comunidadId (Unidades por Comunidad)', async () => {
      const endpoint = `/unidades/comunidad/${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id (Detalle de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/tenencias (Tenencias de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/tenencias`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/residentes (Residentes de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/residentes`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades (Lista de Unidades)', async () => {
      const endpoint = `/unidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 2. Información Financiera
  // =========================================
  describe('Información Financiera', () => {
    test('GET /unidades/:id/summary (Resumen Financiero)', async () => {
      const endpoint = `/unidades/${unidadId}/summary`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/cuentas (Cuentas de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/cuentas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/cuentas/:cuentaId/detalle (Detalle de Cuenta)', async () => {
      const endpoint = `/unidades/cuentas/${cuentaId}/detalle`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/cuentas_full (Cuentas Completas)', async () => {
      const endpoint = `/unidades/${unidadId}/cuentas_full`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/pagos (Pagos de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/pagos`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/cuentas/:cuentaId/aplicaciones (Aplicaciones de Cuenta)', async () => {
      const endpoint = `/unidades/cuentas/${cuentaId}/aplicaciones`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/financiero (Información Financiera)', async () => {
      const endpoint = `/unidades/${unidadId}/financiero`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 3. Medidores y Servicios
  // =========================================
  describe('Medidores y Servicios', () => {
    test('GET /unidades/:id/medidores (Medidores de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/medidores`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/medidores/:medidorId/lecturas (Lecturas de Medidor)', async () => {
      const endpoint = `/unidades/medidores/${medidorId}/lecturas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 4. Gestión y Administración
  // =========================================
  describe('Gestión y Administración', () => {
    test('GET /unidades/:id/tickets (Tickets de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/tickets`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/multas (Multas de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/multas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/:id/reservas (Reservas de Unidad)', async () => {
      const endpoint = `/unidades/${unidadId}/reservas`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // 5. Dropdowns y Listas
  // =========================================
  describe('Dropdowns y Listas', () => {
    test('GET /unidades/dropdowns/comunidades (Lista de Comunidades)', async () => {
      const endpoint = `/unidades/dropdowns/comunidades`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/dropdowns/edificios (Lista de Edificios)', async () => {
      const endpoint = `/unidades/dropdowns/edificios?comunidad_id=${comunidadId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/dropdowns/torres (Lista de Torres)', async () => {
      const endpoint = `/unidades/dropdowns/torres?edificio_id=${edificioId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /unidades/dropdowns/unidades (Lista de Unidades)', async () => {
      const endpoint = `/unidades/dropdowns/unidades?torre_id=${torreId}`;
      const response = await getWithAuth(app, endpoint, authToken);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });
});
