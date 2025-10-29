const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// Estados válidos de conciliación
const ESTADOS_CONCILIACION = ['pendiente', 'conciliado', 'descartado'];

// =========================================
// 1. LISTAR CONCILIACIONES CON FILTROS
// =========================================

/**
 * @swagger
 * /conciliaciones:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Listar todas las conciliaciones con filtros y paginación
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      comunidad_id,
      estado,
      fecha_inicio,
      fecha_fin,
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
        cb.fecha_mov AS movementDate,
        cb.glosa,
        cb.monto AS amount,
        COALESCE(p.medio, 'No Aplicable') AS movementType,
        cb.referencia AS bankReference,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pendiente'
          WHEN cb.estado = 'conciliado' THEN 'reconciliado'
          WHEN cb.estado = 'descartado' THEN 'descartado'
          ELSE 'pendiente'
        END AS reconciliationStatus,
        p.id AS paymentId,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS paymentCode,
        p.referencia AS paymentReference,
        c.razon_social AS communityName,
        cb.created_at,
        cb.updated_at
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND cb.comunidad_id = ?';
      params.push(comunidad_id);
    }

    if (estado) {
      query += ' AND cb.estado = ?';
      params.push(estado);
    }

    if (fecha_inicio) {
      query += ' AND cb.fecha_mov >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND cb.fecha_mov <= ?';
      params.push(fecha_fin);
    }

    // Obtener total
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY cb.fecha_mov DESC, cb.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    res.json({
      data: rows,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliaciones' });
  }
});

/**
 * @swagger
 * /conciliaciones/{id}:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Obtener conciliación por ID con detalle completo
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
        cb.fecha_mov AS movementDate,
        cb.glosa,
        cb.monto AS amount,
        COALESCE(p.medio, 'No Aplicable') AS movementType,
        cb.referencia AS bankReference,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pending'
          WHEN cb.estado = 'conciliado' THEN 'reconciled'
          WHEN cb.estado = 'descartado' THEN 'discarded'
          ELSE 'pending'
        END AS reconciliationStatus,
        p.id AS paymentId,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS paymentCode,
        p.referencia AS paymentReference,
        p.monto AS paymentAmount,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'applied'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS paymentStatus,
        c.razon_social AS communityName,
        u.codigo AS unitNumber,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS residentName,
        cb.created_at,
        cb.updated_at
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE cb.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Conciliación no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliación' });
  }
});

// =========================================
// 2. CONCILIACIONES POR COMUNIDAD
// =========================================

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Listar conciliaciones de una comunidad específica
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 200 } = req.query;

    const query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
        cb.fecha_mov AS movementDate,
        cb.glosa,
        cb.monto AS amount,
        COALESCE(p.medio, 'No Aplicable') AS movementType,
        cb.referencia AS bankReference,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pending'
          WHEN cb.estado = 'conciliado' THEN 'reconciled'
          WHEN cb.estado = 'descartado' THEN 'discarded'
          ELSE 'pending'
        END AS reconciliationStatus,
        p.referencia AS paymentReference,
        cb.created_at
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.comunidad_id = ?
      ORDER BY cb.fecha_mov DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [comunidadId, Number(limit)]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliaciones' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}:
 *   post:
 *     tags: [Conciliaciones]
 *     summary: Crear nueva conciliación bancaria
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin', 'contador']),
    body('fecha_mov').notEmpty().withMessage('Fecha de movimiento es requerida'),
    body('monto').isNumeric().withMessage('Monto debe ser numérico'),
    body('glosa').optional(),
    body('referencia').optional(),
    body('pago_id').optional().isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_mov, monto, glosa, referencia, pago_id } = req.body;

      const [result] = await db.query(
        'INSERT INTO conciliacion_bancaria (comunidad_id, fecha_mov, monto, glosa, referencia, pago_id) VALUES (?,?,?,?,?,?)',
        [comunidadId, fecha_mov, monto, glosa || null, referencia || null, pago_id || null]
      );

      const [row] = await db.query(
        'SELECT id, fecha_mov, monto, glosa, referencia, estado FROM conciliacion_bancaria WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear conciliación' });
    }
  }
);

// =========================================
// 3. ESTADÍSTICAS DE CONCILIACIONES
// =========================================

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Estadísticas generales de conciliaciones por comunidad
 */
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        COUNT(*) AS totalMovements,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledMovements,
        COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) AS pendingMovements,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS discardedMovements,
        SUM(cb.monto) AS totalAmount,
        AVG(cb.monto) AS averageAmount,
        COUNT(CASE WHEN cb.monto > 0 THEN 1 END) AS creditMovements,
        COUNT(CASE WHEN cb.monto < 0 THEN 1 END) AS debitMovements,
        MIN(cb.fecha_mov) AS oldestMovement,
        MAX(cb.fecha_mov) AS newestMovement
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/pendientes:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Movimientos bancarios pendientes de conciliación
 */
router.get('/comunidad/:comunidadId/pendientes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
        cb.fecha_mov AS movementDate,
        cb.glosa,
        cb.monto AS amount,
        COALESCE(p.medio, 'No Aplicable') AS movementType,
        cb.referencia AS bankReference,
        c.razon_social AS communityName,
        cb.created_at
      FROM conciliacion_bancaria cb
      JOIN comunidad c ON cb.comunidad_id = c.id
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.estado = 'pendiente'
        AND cb.comunidad_id = ?
      ORDER BY cb.fecha_mov ASC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos pendientes' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/por-estado:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Conciliaciones agrupadas por estado
 */
router.get('/comunidad/:comunidadId/por-estado', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pending'
          WHEN cb.estado = 'conciliado' THEN 'reconciled'
          WHEN cb.estado = 'descartado' THEN 'discarded'
          ELSE 'pending'
        END AS status,
        COUNT(*) AS count,
        SUM(cb.monto) AS totalAmount,
        AVG(cb.monto) AS averageAmount
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      GROUP BY cb.estado
      ORDER BY
        CASE cb.estado
          WHEN 'pendiente' THEN 1
          WHEN 'descartado' THEN 2
          WHEN 'conciliado' THEN 3
          ELSE 4
        END
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agrupar por estado' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/por-tipo:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Conciliaciones agrupadas por tipo de movimiento
 */
router.get('/comunidad/:comunidadId/por-tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        COALESCE(p.medio, 'Movimiento No Pagado') AS type,
        COUNT(cb.id) AS count,
        SUM(cb.monto) AS totalAmount,
        AVG(cb.monto) AS averageAmount,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledCount
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.comunidad_id = ?
      GROUP BY p.medio
      ORDER BY totalAmount DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agrupar por tipo' });
  }
});

// =========================================
// 4. ANÁLISIS DE DIFERENCIAS
// =========================================

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/con-diferencias:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Movimientos con diferencias entre banco y pago
 */
router.get('/comunidad/:comunidadId/con-diferencias', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
        cb.fecha_mov AS movementDate,
        cb.glosa,
        cb.monto AS bankAmount,
        p.monto AS paymentAmount,
        (cb.monto - COALESCE(p.monto, 0)) AS difference,
        COALESCE(p.medio, 'No Aplicable') AS movementType,
        cb.referencia AS bankReference,
        p.referencia AS paymentReference,
        c.razon_social AS communityName
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE cb.estado = 'descartado'
        AND cb.comunidad_id = ?
      ORDER BY ABS(cb.monto - COALESCE(p.monto, 0)) DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener diferencias' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/sin-pago:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Movimientos bancarios sin pagos asociados
 */
router.get('/comunidad/:comunidadId/sin-pago', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
        cb.fecha_mov AS movementDate,
        cb.glosa,
        cb.monto AS amount,
        'No Aplicable' AS movementType,
        cb.referencia AS bankReference,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pending'
          WHEN cb.estado = 'conciliado' THEN 'reconciled'
          WHEN cb.estado = 'descartado' THEN 'discarded'
          ELSE 'pending'
        END AS reconciliationStatus,
        c.razon_social AS communityName,
        cb.created_at
      FROM conciliacion_bancaria cb
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE cb.pago_id IS NULL
        AND cb.comunidad_id = ?
      ORDER BY cb.fecha_mov DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos sin pago' });
  }
});

// =========================================
// 5. REPORTES HISTÓRICOS
// =========================================

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/historial-periodo:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Historial de conciliaciones por período (mes/año)
 */
router.get('/comunidad/:comunidadId/historial-periodo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        YEAR(cb.fecha_mov) AS year,
        MONTH(cb.fecha_mov) AS month,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m') AS period,
        COUNT(*) AS totalMovements,
        SUM(cb.monto) AS totalAmount,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledCount,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS discardedCount,
        COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) AS pendingCount,
        ROUND(
          (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
          2
        ) AS reconciliationPercentage
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
      ORDER BY year DESC, month DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/saldos:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Comparación de saldos bancarios vs contables
 */
router.get('/comunidad/:comunidadId/saldos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        YEAR(cb.fecha_mov) AS year,
        MONTH(cb.fecha_mov) AS month,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m') AS period,
        SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) AS bankCredits,
        SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END) AS bankDebits,
        (
          SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) +
          SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
        ) AS bankBalance,
        COALESCE(SUM(p.monto), 0) AS bookPayments,
        (
          SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) +
          SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
        ) - COALESCE(SUM(p.monto), 0) AS difference
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id AND p.estado = 'aplicado'
      WHERE cb.comunidad_id = ?
      GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
      ORDER BY year DESC, month DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular saldos' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/analisis-precision:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Análisis de precisión de conciliación por período
 */
router.get('/comunidad/:comunidadId/analisis-precision', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        YEAR(cb.fecha_mov) AS year,
        MONTH(cb.fecha_mov) AS month,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m') AS period,
        COUNT(*) AS totalMovements,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledMovements,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS differenceMovements,
        ROUND(
          (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
          2
        ) AS accuracyPercentage,
        AVG(ABS(cb.monto - COALESCE(p.monto, 0))) AS averageDifference,
        MAX(ABS(cb.monto - COALESCE(p.monto, 0))) AS maxDifference
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.comunidad_id = ?
      GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
      ORDER BY year DESC, month DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al analizar precisión' });
  }
});

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/resumen:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Resumen consolidado de conciliaciones por comunidad
 */
router.get('/comunidad/:comunidadId/resumen', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        c.razon_social AS communityName,
        COUNT(cb.id) AS totalMovements,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledMovements,
        COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) AS pendingMovements,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS differenceMovements,
        SUM(cb.monto) AS totalBankAmount,
        COUNT(DISTINCT p.id) AS linkedPayments,
        ROUND(
          (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / NULLIF(COUNT(cb.id), 0),
          2
        ) AS reconciliationRate,
        MIN(cb.fecha_mov) AS oldestMovement,
        MAX(cb.fecha_mov) AS newestMovement
      FROM comunidad c
      LEFT JOIN conciliacion_bancaria cb ON c.id = cb.comunidad_id
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE c.id = ?
      GROUP BY c.id, c.razon_social
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// =========================================
// 6. VALIDACIONES
// =========================================

/**
 * @swagger
 * /conciliaciones/comunidad/{comunidadId}/validar:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Validar que las conciliaciones tienen datos necesarios
 */
router.get('/comunidad/:comunidadId/validar', authenticate, requireCommunity('comunidadId', ['admin', 'contador']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        cb.id,
        CASE
          WHEN cb.comunidad_id IS NULL THEN 'Missing community reference'
          WHEN cb.fecha_mov IS NULL THEN 'Missing movement date'
          WHEN cb.monto = 0 THEN 'Invalid amount'
          WHEN cb.estado NOT IN ('pendiente', 'conciliado', 'descartado') THEN 'Invalid reconciliation status'
          ELSE 'Valid'
        END AS validation_status,
        cb.monto,
        cb.fecha_mov,
        cb.estado,
        CASE WHEN cb.pago_id IS NOT NULL THEN 'Linked' ELSE 'Unlinked' END AS payment_link_status
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      HAVING validation_status != 'Valid'
      ORDER BY cb.id
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al validar conciliaciones' });
  }
});

// =========================================
// 7. ACTUALIZACIÓN DE CONCILIACIONES
// =========================================

/**
 * @swagger
 * /conciliaciones/{id}:
 *   patch:
 *     tags: [Conciliaciones]
 *     summary: Actualizar estado de conciliación
 */
router.patch('/:id', authenticate, authorize('admin', 'superadmin', 'contador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, pago_id, glosa } = req.body;

    const updates = [];
    const values = [];

    if (estado !== undefined) {
      if (!ESTADOS_CONCILIACION.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      updates.push('estado = ?');
      values.push(estado);
    }

    if (pago_id !== undefined) {
      updates.push('pago_id = ?');
      values.push(pago_id);
    }

    if (glosa !== undefined) {
      updates.push('glosa = ?');
      values.push(glosa);
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.query(
      `UPDATE conciliacion_bancaria SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await db.query(
      'SELECT id, fecha_mov, monto, glosa, referencia, estado, pago_id FROM conciliacion_bancaria WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar conciliación' });
  }
});

/**
 * @swagger
 * /conciliaciones/{id}/conciliar:
 *   patch:
 *     tags: [Conciliaciones]
 *     summary: Conciliar un movimiento con un pago
 */
router.patch('/:id/conciliar', authenticate, authorize('admin', 'superadmin', 'contador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { pago_id } = req.body;

    if (!pago_id) {
      return res.status(400).json({ error: 'pago_id es requerido' });
    }

    await db.query(
      'UPDATE conciliacion_bancaria SET estado = ?, pago_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['conciliado', pago_id, id]
    );

    const [rows] = await db.query(
      'SELECT id, fecha_mov, monto, glosa, referencia, estado, pago_id FROM conciliacion_bancaria WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al conciliar movimiento' });
  }
});

/**
 * @swagger
 * /conciliaciones/{id}/descartar:
 *   patch:
 *     tags: [Conciliaciones]
 *     summary: Descartar un movimiento
 */
router.patch('/:id/descartar', authenticate, authorize('admin', 'superadmin', 'contador'), async (req, res) => {
  try {
    const { id } = req.params;
    const { glosa } = req.body;

    const updates = ['estado = ?'];
    const values = ['descartado'];

    if (glosa) {
      updates.push('glosa = ?');
      values.push(glosa);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.query(
      `UPDATE conciliacion_bancaria SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await db.query(
      'SELECT id, fecha_mov, monto, glosa, referencia, estado, pago_id FROM conciliacion_bancaria WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al descartar movimiento' });
  }
});

module.exports = router;


// =========================================
// ENDPOINTS DE CONCILIACIONES
// =========================================

// // 1. LISTAR CONCILIACIONES CON FILTROS
// GET: /conciliaciones
// GET: /conciliaciones/:id

// // 2. CONCILIACIONES POR COMUNIDAD
// GET: /conciliaciones/comunidad/:comunidadId
// POST: /conciliaciones/comunidad/:comunidadId

// // 3. ESTADÍSTICAS DE CONCILIACIONES
// GET: /conciliaciones/comunidad/:comunidadId/estadisticas
// GET: /conciliaciones/comunidad/:comunidadId/pendientes
// GET: /conciliaciones/comunidad/:comunidadId/por-estado
// GET: /conciliaciones/comunidad/:comunidadId/por-tipo

// // 4. ANÁLISIS DE DIFERENCIAS
// GET: /conciliaciones/comunidad/:comunidadId/con-diferencias
// GET: /conciliaciones/comunidad/:comunidadId/sin-pago

// // 5. REPORTES HISTÓRICOS
// GET: /conciliaciones/comunidad/:comunidadId/historial-periodo
// GET: /conciliaciones/comunidad/:comunidadId/saldos
// GET: /conciliaciones/comunidad/:comunidadId/analisis-precision
// GET: /conciliaciones/comunidad/:comunidadId/resumen

// // 6. VALIDACIONES
// GET: /conciliaciones/comunidad/:comunidadId/validar

// // 7. ACTUALIZACIÓN DE CONCILIACIONES
// PATCH: /conciliaciones/:id
// PATCH: /conciliaciones/:id/conciliar
// PATCH: /conciliaciones/:id/descartar




