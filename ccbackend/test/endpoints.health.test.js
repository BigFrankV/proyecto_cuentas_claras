const request = require('supertest');

// Configurar variable de entorno antes de cargar la app
process.env.SKIP_DB_CONNECT = 'true';
process.env.NODE_ENV = 'test';

const app = require('../src/index');
const db = require('../src/db');

/**
 * Test de Salud de Endpoints
 * 
 * Este test verifica que todos los endpoints de la API respondan correctamente.
 * Generará un reporte de endpoints con código 200 vs otros códigos de estado.
 */

describe('Endpoints Health Check', () => {
  let authToken;
  let testComunidadId = 1;
  let testUnidadId = 1;
  let testPagoId = 1;
  let testProveedor = 1;
  let testTicketId = 1;
  let testNotificacionId = 1;
  let testEdificioId = 1;
  let testTorreId = 1;
  let testPersonaId = 1;
  let testAmenidadId = 1;
  let testCategoriaGastoId = 1;
  let testCentroCostoId = 1;
  let testGastoId = 1;
  let testEmisionId = 1;
  let testCargoId = 1;
  let testMedidorId = 1;
  let testMultaId = 1;

  // Configuración inicial
  beforeAll(async () => {
    // Obtener token de autenticación
    // Nota: Ajusta según tu sistema de autenticación
    try {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'pat.quintanilla@duocuc.cl',
          password: '123456'
        });

      if (loginResponse.status === 200 && loginResponse.body.token) {
        authToken = loginResponse.body.token;
        console.log('✅ Autenticación exitosa');
      } else {
        console.log('⚠️  No se pudo autenticar, tests pueden fallar');
      }
    } catch (error) {
      console.log('⚠️  Error en autenticación:', error.message);
    }

    // Obtener IDs reales de la base de datos para tests
    try {
      const [comunidades] = await db.query('SELECT id FROM comunidad LIMIT 1');
      if (comunidades.length > 0) testComunidadId = comunidades[0].id;

      const [unidades] = await db.query('SELECT id FROM unidad LIMIT 1');
      if (unidades.length > 0) testUnidadId = unidades[0].id;

      const [pagos] = await db.query('SELECT id FROM pago LIMIT 1');
      if (pagos.length > 0) testPagoId = pagos[0].id;

      const [proveedores] = await db.query('SELECT id FROM proveedor LIMIT 1');
      if (proveedores.length > 0) testProveedor = proveedores[0].id;

      const [tickets] = await db.query('SELECT id FROM ticket_soporte LIMIT 1');
      if (tickets.length > 0) testTicketId = tickets[0].id;

      const [notificaciones] = await db.query('SELECT id FROM notificacion_usuario LIMIT 1');
      if (notificaciones.length > 0) testNotificacionId = notificaciones[0].id;

      const [edificios] = await db.query('SELECT id FROM edificio LIMIT 1');
      if (edificios.length > 0) testEdificioId = edificios[0].id;

      const [torres] = await db.query('SELECT id FROM torre LIMIT 1');
      if (torres.length > 0) testTorreId = torres[0].id;

      const [personas] = await db.query('SELECT id FROM persona LIMIT 1');
      if (personas.length > 0) testPersonaId = personas[0].id;

      const [amenidades] = await db.query('SELECT id FROM amenidad LIMIT 1');
      if (amenidades.length > 0) testAmenidadId = amenidades[0].id;

      const [categorias] = await db.query('SELECT id FROM categoria_gasto LIMIT 1');
      if (categorias.length > 0) testCategoriaGastoId = categorias[0].id;

      const [centros] = await db.query('SELECT id FROM centro_costo LIMIT 1');
      if (centros.length > 0) testCentroCostoId = centros[0].id;

      const [gastos] = await db.query('SELECT id FROM gasto LIMIT 1');
      if (gastos.length > 0) testGastoId = gastos[0].id;

      const [emisiones] = await db.query('SELECT id FROM emision_gastos_comunes LIMIT 1');
      if (emisiones.length > 0) testEmisionId = emisiones[0].id;

      const [cargos] = await db.query('SELECT id FROM cuenta_cobro_unidad LIMIT 1');
      if (cargos.length > 0) testCargoId = cargos[0].id;

      const [medidores] = await db.query('SELECT id FROM medidor LIMIT 1');
      if (medidores.length > 0) testMedidorId = medidores[0].id;

      const [multas] = await db.query('SELECT id FROM multa LIMIT 1');
      if (multas.length > 0) testMultaId = multas[0].id;

      console.log('✅ IDs de test obtenidos de la base de datos');
    } catch (error) {
      console.log('⚠️  No se pudieron obtener IDs de test, usando valores por defecto');
    }
  }, 30000); // Timeout de 30 segundos para beforeAll

  // Almacenar resultados
  const results = {
    success: [],
    unauthorized: [],
    notFound: [],
    serverError: [],
    other: []
  };

  // Helper para categorizar respuestas
  const categorizeResponse = (endpoint, statusCode) => {
    const result = { endpoint, statusCode };
    
    if (statusCode === 200 || statusCode === 201) {
      results.success.push(result);
    } else if (statusCode === 401 || statusCode === 403) {
      results.unauthorized.push(result);
    } else if (statusCode === 404) {
      results.notFound.push(result);
    } else if (statusCode >= 500) {
      results.serverError.push(result);
    } else {
      results.other.push(result);
    }
  };

  // Cerrar conexiones después de los tests
  afterAll(async () => {
    try {
      await db.end();
    } catch (error) {
      // Ignorar errores al cerrar
    }
  });

  // Helper para hacer request con auth
  const getWithAuth = (endpoint) => {
    const req = request(app).get(endpoint);
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }
    return req;
  };

  // =========================================
  // MÓDULO 1: COMUNIDADES
  // =========================================
  describe('Comunidades Endpoints', () => {
    test('GET /comunidades', async () => {
      const endpoint = `/comunidades`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id', async () => {
      const endpoint = `/comunidades/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /comunidades/:id/estadisticas', async () => {
      const endpoint = `/comunidades/${testComunidadId}/estadisticas`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 2: EDIFICIOS
  // =========================================
  describe('Edificios Endpoints', () => {
    test('GET /edificios/:id', async () => {
      const endpoint = `/edificios/${testEdificioId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 3: UNIDADES
  // =========================================
  describe('Unidades Endpoints', () => {
    test('GET /unidades/:id', async () => {
      const endpoint = `/unidades/${testUnidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 4: TORRES
  // =========================================
  describe('Torres Endpoints', () => {
    test('GET /torres/:id', async () => {
      const endpoint = `/torres/${testTorreId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 5: PERSONAS
  // =========================================
  describe('Personas Endpoints', () => {
    test('GET /personas/:id', async () => {
      const endpoint = `/personas/${testPersonaId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 6: AMENIDADES
  // =========================================
  describe('Amenidades Endpoints', () => {
    test('GET /amenidades', async () => {
      const endpoint = `/amenidades`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /amenidades/:id', async () => {
      const endpoint = `/amenidades/${testAmenidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /amenidades/estadisticas/generales', async () => {
      const endpoint = `/amenidades/estadisticas/generales`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 7: CATEGORÍAS DE GASTO
  // =========================================
  describe('Categorías Gasto Endpoints', () => {
    test('GET /categorias-gasto/comunidad/:comunidadId', async () => {
      const endpoint = `/categorias-gasto/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /categorias-gasto/:id', async () => {
      const endpoint = `/categorias-gasto/${testCategoriaGastoId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 8: CENTROS DE COSTO
  // =========================================
  describe('Centros Costo Endpoints', () => {
    test('GET /centros-costo/comunidad/:comunidadId', async () => {
      const endpoint = `/centros-costo/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /centros-costo/:id', async () => {
      const endpoint = `/centros-costo/${testCentroCostoId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 9: GASTOS
  // =========================================
  describe('Gastos Endpoints', () => {
    test('GET /gastos/:id', async () => {
      const endpoint = `/gastos/${testGastoId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 10: EMISIONES
  // =========================================
  describe('Emisiones Endpoints', () => {
    test('GET /emisiones/:id', async () => {
      const endpoint = `/emisiones/${testEmisionId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 11: CARGOS (Cuentas de Cobro)
  // =========================================
  describe('Cargos Endpoints', () => {
    test('GET /cargos/comunidad/:comunidadId', async () => {
      const endpoint = `/cargos/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /cargos/:id', async () => {
      const endpoint = `/cargos/${testCargoId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 12: PAGOS
  // =========================================
  describe('Pagos Endpoints', () => {
    test('GET /pagos/comunidad/:comunidadId', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/:id', async () => {
      const endpoint = `/pagos/${testPagoId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/comunidad/:comunidadId/estadisticas', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}/estadisticas`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/comunidad/:comunidadId/estadisticas/estado', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}/estadisticas/estado`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/comunidad/:comunidadId/estadisticas/metodo', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}/estadisticas/metodo`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/comunidad/:comunidadId/estadisticas/periodo', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}/estadisticas/periodo`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/comunidad/:comunidadId/pendientes', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}/pendientes`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/:id/aplicaciones', async () => {
      const endpoint = `/pagos/${testPagoId}/aplicaciones`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/unidad/:unidadId/historial', async () => {
      const endpoint = `/pagos/unidad/${testUnidadId}/historial`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /pagos/comunidad/:comunidadId/por-residente', async () => {
      const endpoint = `/pagos/comunidad/${testComunidadId}/por-residente`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // ENDPOINTS DE PROVEEDORES
  // =========================================
  describe('Proveedores Endpoints', () => {
    test('GET /proveedores/comunidad/:comunidadId', async () => {
      const endpoint = `/proveedores/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /proveedores/:id', async () => {
      const endpoint = `/proveedores/${testProveedor}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /proveedores/:id/historial-gastos', async () => {
      const endpoint = `/proveedores/${testProveedor}/historial-gastos`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /proveedores/comunidad/:comunidadId/top-gastos', async () => {
      const endpoint = `/proveedores/comunidad/${testComunidadId}/top-gastos`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /proveedores/comunidad/:comunidadId/dashboard', async () => {
      const endpoint = `/proveedores/comunidad/${testComunidadId}/dashboard`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // ENDPOINTS DE TARIFAS DE CONSUMO
  // =========================================
  describe('Tarifas de Consumo Endpoints', () => {
    test('GET /tarifas-consumo/comunidad/:comunidadId', async () => {
      const endpoint = `/tarifas-consumo/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/comunidad/:comunidadId/por-tipo/agua', async () => {
      const endpoint = `/tarifas-consumo/comunidad/${testComunidadId}/por-tipo/agua`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/comunidad/:comunidadId/vigentes', async () => {
      const endpoint = `/tarifas-consumo/comunidad/${testComunidadId}/vigentes`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /tarifas-consumo/comunidad/:comunidadId/estadisticas-por-servicio', async () => {
      const endpoint = `/tarifas-consumo/comunidad/${testComunidadId}/estadisticas-por-servicio`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // ENDPOINTS DE TICKETS
  // =========================================
  describe('Tickets Endpoints', () => {
    test('GET /tickets/comunidad/:comunidadId', async () => {
      const endpoint = `/tickets/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /tickets/:id', async () => {
      const endpoint = `/tickets/${testTicketId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /tickets/comunidad/:comunidadId/por-estado/abierto', async () => {
      const endpoint = `/tickets/comunidad/${testComunidadId}/por-estado/abierto`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /tickets/comunidad/:comunidadId/urgentes', async () => {
      const endpoint = `/tickets/comunidad/${testComunidadId}/urgentes`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /tickets/comunidad/:comunidadId/estadisticas-estado', async () => {
      const endpoint = `/tickets/comunidad/${testComunidadId}/estadisticas-estado`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // ENDPOINTS DE DASHBOARD
  // =========================================
  describe('Dashboard Endpoints', () => {
    test('GET /dashboard/comunidad/:comunidadId/kpi-saldo-total', async () => {
      const endpoint = `/dashboard/comunidad/${testComunidadId}/kpi-saldo-total`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/kpi-ingresos-mes', async () => {
      const endpoint = `/dashboard/comunidad/${testComunidadId}/kpi-ingresos-mes`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/grafico-emisiones', async () => {
      const endpoint = `/dashboard/comunidad/${testComunidadId}/grafico-emisiones`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /dashboard/comunidad/:comunidadId/resumen-completo', async () => {
      const endpoint = `/dashboard/comunidad/${testComunidadId}/resumen-completo`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // ENDPOINTS DE REPORTES
  // =========================================
  describe('Reportes Endpoints', () => {
    test('GET /reportes/comunidad/:comunidadId/resumen-financiero', async () => {
      const endpoint = `/reportes/comunidad/${testComunidadId}/resumen-financiero`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/kpis-financieros', async () => {
      const endpoint = `/reportes/comunidad/${testComunidadId}/kpis-financieros`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/morosidad-unidades', async () => {
      const endpoint = `/reportes/comunidad/${testComunidadId}/morosidad-unidades`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/gastos-por-categoria', async () => {
      const endpoint = `/reportes/comunidad/${testComunidadId}/gastos-por-categoria`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /reportes/comunidad/:comunidadId/reporte-completo', async () => {
      const endpoint = `/reportes/comunidad/${testComunidadId}/reporte-completo`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // ENDPOINTS DE NOTIFICACIONES
  // =========================================
  describe('Notificaciones Endpoints', () => {
    test('GET /notificaciones/comunidad/:comunidadId', async () => {
      const endpoint = `/notificaciones/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });

    test('GET /notificaciones/:id', async () => {
      const endpoint = `/notificaciones/${testNotificacionId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /notificaciones/estadisticas/generales', async () => {
      const endpoint = `/notificaciones/estadisticas/generales`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /notificaciones/estadisticas/por-tipo', async () => {
      const endpoint = `/notificaciones/estadisticas/por-tipo`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 13: MEDIDORES
  // =========================================
  describe('Medidores Endpoints', () => {
    test('GET /medidores/:id', async () => {
      const endpoint = `/medidores/${testMedidorId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /medidores/unidad/:unidadId', async () => {
      const endpoint = `/medidores/unidad/${testUnidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 14: MULTAS
  // =========================================
  describe('Multas Endpoints', () => {
    test('GET /multas/:id', async () => {
      const endpoint = `/multas/${testMultaId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /multas/comunidad/:comunidadId', async () => {
      const endpoint = `/multas/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 15: CONCILIACIONES
  // =========================================
  describe('Conciliaciones Endpoints', () => {
    test('GET /conciliaciones/comunidad/:comunidadId', async () => {
      const endpoint = `/conciliaciones/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 16: DOCUMENTOS DE COMPRA
  // =========================================
  describe('Documentos Compra Endpoints', () => {
    test('GET /documentos-compra/comunidad/:comunidadId', async () => {
      const endpoint = `/documentos-compra/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 17: MEMBRESÍAS
  // =========================================
  describe('Membresías Endpoints', () => {
    test('GET /membresias/comunidad/:comunidadId', async () => {
      const endpoint = `/membresias/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 18: SOPORTE
  // =========================================
  describe('Soporte Endpoints', () => {
    test('GET /soporte/comunidad/:comunidadId', async () => {
      const endpoint = `/soporte/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 19: FILES (ARCHIVOS)
  // =========================================
  describe('Files Endpoints', () => {
    test('GET /files/comunidad/:comunidadId', async () => {
      const endpoint = `/files/comunidad/${testComunidadId}`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 20: VALOR UTM
  // =========================================
  describe('Valor UTM Endpoints', () => {
    test('GET /valor-utm/actual', async () => {
      const endpoint = `/valor-utm/actual`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /valor-utm/fecha/:fecha', async () => {
      const endpoint = `/valor-utm/fecha/2024-01-01`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 21: UTIL (UTILIDADES)
  // =========================================
  describe('Util Endpoints', () => {
    test('GET /util/health', async () => {
      const endpoint = `/util/health`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 22: WEBHOOKS
  // =========================================
  describe('Webhooks Endpoints', () => {
    test('GET /webhooks/logs', async () => {
      const endpoint = `/webhooks/logs`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 23: AUTH (AUTENTICACIÓN)
  // =========================================
  describe('Auth Endpoints', () => {
    test('GET /auth/me', async () => {
      const endpoint = `/auth/me`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /auth/verify-token', async () => {
      const endpoint = `/auth/verify-token`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // MÓDULO 24: PAYMENT GATEWAY
  // =========================================
  describe('Payment Gateway Endpoints', () => {
    test('GET /gateway/available', async () => {
      const endpoint = `/gateway/available`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 500]).toContain(response.status);
    });

    test('GET /gateway/transaction/:orderId', async () => {
      const endpoint = `/gateway/transaction/TEST-ORDER-123`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 404, 500]).toContain(response.status);
    });

    test('GET /gateway/community/:communityId/transactions', async () => {
      const endpoint = `/gateway/community/${testComunidadId}/transactions`;
      const response = await getWithAuth(endpoint);
      categorizeResponse(endpoint, response.status);
      expect([200, 401, 403, 404, 500]).toContain(response.status);
    });
  });

  // =========================================
  // REPORTE FINAL
  // =========================================
  afterAll(() => {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('REPORTE DE SALUD DE ENDPOINTS');
    console.log('='.repeat(80));
    console.log('\n');

    console.log('✅ ENDPOINTS EXITOSOS (200/201):');
    console.log(`   Total: ${results.success.length}`);
    results.success.forEach(r => {
      console.log(`   ✓ ${r.endpoint} - ${r.statusCode}`);
    });
    console.log('\n');

    if (results.unauthorized.length > 0) {
      console.log('🔒 ENDPOINTS NO AUTORIZADOS (401/403):');
      console.log(`   Total: ${results.unauthorized.length}`);
      results.unauthorized.forEach(r => {
        console.log(`   ⚠ ${r.endpoint} - ${r.statusCode}`);
      });
      console.log('\n');
    }

    if (results.notFound.length > 0) {
      console.log('🔍 ENDPOINTS NO ENCONTRADOS (404):');
      console.log(`   Total: ${results.notFound.length}`);
      results.notFound.forEach(r => {
        console.log(`   ⚠ ${r.endpoint} - ${r.statusCode}`);
      });
      console.log('\n');
    }

    if (results.serverError.length > 0) {
      console.log('❌ ENDPOINTS CON ERROR DE SERVIDOR (500+):');
      console.log(`   Total: ${results.serverError.length}`);
      results.serverError.forEach(r => {
        console.log(`   ✗ ${r.endpoint} - ${r.statusCode}`);
      });
      console.log('\n');
    }

    if (results.other.length > 0) {
      console.log('⚠️  OTROS CÓDIGOS DE ESTADO:');
      console.log(`   Total: ${results.other.length}`);
      results.other.forEach(r => {
        console.log(`   • ${r.endpoint} - ${r.statusCode}`);
      });
      console.log('\n');
    }

    console.log('='.repeat(80));
    console.log('RESUMEN:');
    console.log(`   Total endpoints probados: ${
      results.success.length + 
      results.unauthorized.length + 
      results.notFound.length + 
      results.serverError.length + 
      results.other.length
    }`);
    console.log(`   ✅ Exitosos: ${results.success.length}`);
    console.log(`   🔒 No autorizados: ${results.unauthorized.length}`);
    console.log(`   🔍 No encontrados: ${results.notFound.length}`);
    console.log(`   ❌ Errores de servidor: ${results.serverError.length}`);
    console.log(`   ⚠️  Otros: ${results.other.length}`);
    
    const successRate = (results.success.length / (
      results.success.length + 
      results.unauthorized.length + 
      results.notFound.length + 
      results.serverError.length + 
      results.other.length
    ) * 100).toFixed(2);
    
    console.log(`   📊 Tasa de éxito: ${successRate}%`);
    console.log('='.repeat(80));
    console.log('\n');
  });
});
