/**
 * Configuración compartida para todos los tests de health
 */

// Cargar variables de entorno del archivo .env.test
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno antes de cargar la app
process.env.SKIP_DB_CONNECT = 'true';
process.env.NODE_ENV = 'test';

const app = require('../../src/index');
const db = require('../../src/db');

// IDs de prueba que se obtienen de la base de datos
const testIds = {
  comunidadId: 1,
  unidadId: 1,
  pagoId: 1,
  proveedorId: 1,
  ticketId: 1,
  notificacionId: 1,
  edificioId: 1,
  torreId: 1,
  personaId: 1,
  amenidadId: 1,
  categoriaGastoId: 1,
  centroCostoId: 1,
  gastoId: 1,
  emisionId: 1,
  cargoId: 1,
  medidorId: 1,
  multaId: 1,
  membresiaId: 1,
  tarifaConsumoId: 1,
  documentoCompraId: 1,
  conciliacionId: 1,
  reservaId: 1
};

// Token de autenticación
let authToken = null;

/**
 * Inicializa la configuración y obtiene IDs de la BD
 */
async function initializeTestSetup() {
  // Obtener token de autenticación
  const request = require('supertest');
  try {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        identifier: process.env.TEST_USER_EMAIL || 'pat.quintanilla@duocuc.cl',
        password: process.env.TEST_USER_PASSWORD || '123456'
      });

    if (loginResponse.status === 200 && loginResponse.body.token) {
      authToken = loginResponse.body.token;
      console.log('✅ Autenticación exitosa');
    } else {
      console.log('⚠️  No se pudo autenticar, tests pueden fallar');
      console.log('   Status:', loginResponse.status);
      console.log('   Body:', JSON.stringify(loginResponse.body, null, 2));
    }
  } catch (error) {
    console.log('⚠️  Error en autenticación:', error.message);
  }

  // Obtener IDs reales de la base de datos
  try {
    const queries = [
      { key: 'comunidadId', table: 'comunidad' },
      { key: 'unidadId', table: 'unidad' },
      { key: 'pagoId', table: 'pago' },
      { key: 'proveedorId', table: 'proveedor' },
      { key: 'ticketId', table: 'ticket_soporte' },
      { key: 'notificacionId', table: 'notificacion_usuario' },
      { key: 'edificioId', table: 'edificio' },
      { key: 'torreId', table: 'torre' },
      { key: 'personaId', table: 'persona' },
      { key: 'amenidadId', table: 'amenidad' },
      { key: 'categoriaGastoId', table: 'categoria_gasto' },
      { key: 'centroCostoId', table: 'centro_costo' },
      { key: 'gastoId', table: 'gasto' },
      { key: 'emisionId', table: 'emision_gastos_comunes' },
      { key: 'cargoId', table: 'cuenta_cobro_unidad' },
      { key: 'medidorId', table: 'medidor' },
      { key: 'multaId', table: 'multa' }
    ];

    for (const query of queries) {
      const [rows] = await db.query(`SELECT id FROM ${query.table} LIMIT 1`);
      if (rows.length > 0) {
        testIds[query.key] = rows[0].id;
      }
    }

    console.log('✅ IDs de test obtenidos de la base de datos');
  } catch (error) {
    console.log('⚠️  No se pudieron obtener IDs de test, usando valores por defecto');
  }
}

/**
 * Limpia recursos después de los tests
 */
async function cleanupTestSetup() {
  // Guardar resultados temporales para el reporte final
  const { saveResultsToTemp } = require('./helpers');
  saveResultsToTemp();
  
  try {
    await db.end();
  } catch (error) {
    // Ignorar errores al cerrar
  }
}

/**
 * Obtiene el token de autenticación, inicializando si es necesario
 */
function getAuthToken() {
  return authToken;
}

module.exports = {
  app,
  db,
  testIds,
  getAuthToken,
  initializeTestSetup,
  cleanupTestSetup
};
