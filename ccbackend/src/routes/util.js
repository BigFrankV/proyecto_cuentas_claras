const express = require('express');
const router = express.Router();
const db = require('../db');
const indicadoresService = require('../services/indicadoresService');
const schedulerService = require('../services/schedulerService');

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Utilidades]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
/**
 * @swagger
 * /version:
 *   get:
 *     tags: [Utilidades]
 *     summary: Obtener versión de la API
 *     responses:
 *       200:
 *         description: Version
 */
router.get('/version', (req, res) => {
  res.json({ version: process.env.npm_package_version || '0.0.0' });
});

// GET /util/uf?fecha=YYYY-MM-DD
router.get('/uf', async (req, res) => {
  const fecha = req.query.fecha;
  if (!fecha) return res.status(400).json({ error: 'fecha required' });
  try {
    const [rows] = await db.query(
      'SELECT fecha, valor FROM uf_valor WHERE fecha = ? LIMIT 1',
      [fecha]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /util/utm?fecha=YYYY-MM
router.get('/utm', async (req, res) => {
  const fecha = req.query.fecha;
  if (!fecha) return res.status(400).json({ error: 'fecha required' });
  try {
    const [rows] = await db.query(
      "SELECT fecha, valor FROM utm_valor WHERE DATE_FORMAT(fecha, '%Y-%m') = ? LIMIT 1",
      [fecha]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /util/validar-rut?rut=XXXXXXXX-D
router.get('/validar-rut', async (req, res) => {
  const rut = req.query.rut;
  if (!rut) return res.status(400).json({ error: 'rut required' });
  // normalize
  const parts = rut.replace(/\./g, '').split('-');
  if (parts.length !== 2) return res.json({ valid: false });
  const num = parts[0];
  const dv = parts[1].toLowerCase();
  // compute dv
  let M = 0,
    S = 1;
  for (let i = num.length - 1; i >= 0; i--) {
    S = (S + Number(num[i]) * (9 - (M++ % 6))) % 11;
  }
  const dvCalc = S ? String(S - 1) : 'k';
  res.json({ valid: dv === dvCalc, dv: dvCalc });
});

/**
 * @swagger
 * /util/sync:
 *   post:
 *     tags: [Utilidades]
 *     summary: Ejecutar sincronización manual de indicadores
 *     responses:
 *       200:
 *         description: Sincronización exitosa
 *       500:
 *         description: Error en sincronización
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await schedulerService.runManualSync();
    res.json({
      success: true,
      message: 'Sincronización completada exitosamente',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en sincronización',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /util/sync/status:
 *   get:
 *     tags: [Utilidades]
 *     summary: Obtener estado del scheduler y estadísticas de datos
 *     responses:
 *       200:
 *         description: Estado del sistema
 */
router.get('/sync/status', async (req, res) => {
  try {
    const schedulerStatus = schedulerService.getStatus();
    const dataStats = await schedulerService.getDataStats();

    res.json({
      success: true,
      scheduler: schedulerStatus,
      data: dataStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /util/sync/init:
 *   post:
 *     tags: [Utilidades]
 *     summary: Ejecutar sincronización inicial con datos históricos
 *     responses:
 *       200:
 *         description: Sincronización inicial exitosa
 *       500:
 *         description: Error en sincronización inicial
 */
router.post('/sync/init', async (req, res) => {
  try {
    await indicadoresService.sincronizacionInicial();
    res.json({
      success: true,
      message: 'Sincronización inicial completada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en sincronización inicial',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /util/sync/manual:
 *   post:
 *     tags: [Utilidades]
 *     summary: Ejecutar sincronización manual de indicadores
 *     responses:
 *       200:
 *         description: Sincronización manual completada
 */
router.post('/sync/manual', async (req, res) => {
  try {
    await indicadoresService.sincronizacionInicial();
    res.json({
      success: true,
      message: 'Sincronización manual completada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en sincronización manual',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /util/indicadores:
 *   get:
 *     tags: [Utilidades]
 *     summary: Obtener últimos valores de todos los indicadores
 *     responses:
 *       200:
 *         description: Últimos valores de indicadores
 */
router.get('/indicadores', async (req, res) => {
  try {
    const [ufRows] = await db.query(
      'SELECT * FROM uf_valor ORDER BY fecha DESC LIMIT 1'
    );
    const [utmRows] = await db.query(
      'SELECT * FROM utm_valor ORDER BY fecha DESC LIMIT 1'
    );
    const [otrosRows] = await db.query(`
      SELECT codigo, nombre, fecha, valor, unidad_medida 
      FROM otros_indicadores 
      WHERE (codigo, fecha) IN (
        SELECT codigo, MAX(fecha) 
        FROM otros_indicadores 
        GROUP BY codigo
      )
    `);

    const response = {
      success: true,
      data: {
        uf: ufRows[0] || null,
        utm: utmRows[0] || null,
        otros: otrosRows || [],
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo indicadores',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /util/uf/historico:
 *   get:
 *     tags: [Utilidades]
 *     summary: Obtener histórico de UF
 *     parameters:
 *       - name: desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - name: hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Histórico de UF
 */
router.get('/uf/historico', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = 'SELECT fecha, valor FROM uf_valor';
    const params = [];

    if (desde && hasta) {
      query += ' WHERE fecha BETWEEN ? AND ?';
      params.push(desde, hasta);
    } else if (desde) {
      query += ' WHERE fecha >= ?';
      params.push(desde);
    } else if (hasta) {
      query += ' WHERE fecha <= ?';
      params.push(hasta);
    }

    query += ' ORDER BY fecha DESC';

    const [rows] = await db.query(query, params);
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo histórico de UF',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /util/utm/historico:
 *   get:
 *     tags: [Utilidades]
 *     summary: Obtener histórico de UTM
 *     parameters:
 *       - name: desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - name: hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Histórico de UTM
 */
router.get('/utm/historico', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query = 'SELECT fecha, valor FROM utm_valor';
    const params = [];

    if (desde && hasta) {
      query += ' WHERE fecha BETWEEN ? AND ?';
      params.push(desde, hasta);
    } else if (desde) {
      query += ' WHERE fecha >= ?';
      params.push(desde);
    } else if (hasta) {
      query += ' WHERE fecha <= ?';
      params.push(hasta);
    }

    query += ' ORDER BY fecha DESC';

    const [rows] = await db.query(query, params);
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo histórico de UTM',
      error: error.message,
    });
  }
});

module.exports = router;

// =========================================
// ENDPOINTS DE UTILIDADES (UTIL)
// =========================================

// // INFORMACIÓN BÁSICA
// GET: /util/health
// GET: /util/version

// // INDICADORES BÁSICOS
// GET: /util/uf
// GET: /util/utm
// GET: /util/indicadores

// // HISTÓRICOS
// GET: /util/uf/historico
// GET: /util/utm/historico

// // UTILIDADES
// GET: /util/validar-rut

// // SINCRONIZACIÓN (SCHEDULER/CRON)
// POST: /util/sync
// GET: /util/sync/status
// POST: /util/sync/init
// POST: /util/sync/manual
