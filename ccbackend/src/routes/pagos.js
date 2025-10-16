const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * tags:
 *   - name: Pagos
 *     description: Gestión de pagos, aplicaciones a cuentas de cobro y reversos
 */

// =========================================
// 1. LISTADOS Y FILTROS
// =========================================

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar pagos con filtros avanzados
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pendiente, aplicado, reversado]
 *       - name: medio
 *         in: query
 *         schema:
 *           type: string
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { estado, medio, fecha_desde, fecha_hasta, search, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        p.monto AS amount,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        p.referencia AS reference,
        p.comprobante_num AS receipt_number,
        c.razon_social AS community_name,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        pers.email AS resident_email,
        p.created_at,
        p.updated_at
      FROM pago p
      JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE p.comunidad_id = ?
    `;

    const params = [comunidadId];

    if (estado) {
      query += ` AND p.estado = ?`;
      params.push(estado);
    }

    if (medio) {
      query += ` AND p.medio = ?`;
      params.push(medio);
    }

    if (fecha_desde) {
      query += ` AND p.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND p.fecha <= ?`;
      params.push(fecha_hasta);
    }

    if (search) {
      query += ` AND (p.referencia LIKE ? OR CONCAT(pers.nombres, ' ', pers.apellidos) LIKE ? OR u.codigo LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY p.fecha DESC, p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    // Contar total
    let countQuery = `SELECT COUNT(*) AS total FROM pago p WHERE p.comunidad_id = ?`;
    const countParams = [comunidadId];

    if (estado) {
      countQuery += ` AND p.estado = ?`;
      countParams.push(estado);
    }
    if (medio) {
      countQuery += ` AND p.medio = ?`;
      countParams.push(medio);
    }
    if (fecha_desde) {
      countQuery += ` AND p.fecha >= ?`;
      countParams.push(fecha_desde);
    }
    if (fecha_hasta) {
      countQuery += ` AND p.fecha <= ?`;
      countParams.push(fecha_hasta);
    }

    const [[{ total }]] = await db.query(countQuery, countParams);

    res.json({
      data: rows,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (Number(offset) + rows.length) < total
      }
    });
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ error: 'Error al listar pagos' });
  }
});

/**
 * @openapi
 * /api/pagos/{id}:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener pago por ID con detalles completos
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        p.monto AS amount,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        p.referencia AS reference,
        p.comprobante_num AS receipt_number,
        c.razon_social AS community_name,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        pers.email AS resident_email,
        pers.telefono AS resident_phone,
        p.created_at,
        p.updated_at
      FROM pago p
      JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE p.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error al obtener pago' });
  }
});

// =========================================
// 2. ESTADÍSTICAS
// =========================================

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas generales de pagos por comunidad
 */
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        COUNT(*) AS total_payments,
        COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_payments,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_payments,
        COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_payments,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount,
        MIN(p.fecha) AS oldest_payment,
        MAX(p.fecha) AS newest_payment,
        COALESCE(SUM(CASE WHEN p.estado = 'aplicado' THEN p.monto ELSE 0 END), 0) AS approved_amount
      FROM pago p
      WHERE p.comunidad_id = ?
    `;

    const [[stats]] = await db.query(query, [comunidadId]);

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de pagos:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/estadisticas/estado:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas agrupadas por estado
 */
router.get('/comunidad/:comunidadId/estadisticas/estado', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        COUNT(*) AS count,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount
      FROM pago p
      WHERE p.comunidad_id = ?
      GROUP BY p.estado
      ORDER BY
        CASE p.estado
          WHEN 'aplicado' THEN 1
          WHEN 'pendiente' THEN 2
          WHEN 'reversado' THEN 3
          ELSE 4
        END
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por estado:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por estado' });
  }
});

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/estadisticas/metodo:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas agrupadas por método de pago
 */
router.get('/comunidad/:comunidadId/estadisticas/metodo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount
      FROM pago p
      WHERE p.comunidad_id = ?
      GROUP BY p.medio
      ORDER BY total_amount DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por método:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por método' });
  }
});

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/estadisticas/periodo:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas agrupadas por período (mes/año)
 */
router.get('/comunidad/:comunidadId/estadisticas/periodo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        YEAR(p.fecha) AS year,
        MONTH(p.fecha) AS month,
        DATE_FORMAT(p.fecha, '%Y-%m') AS period,
        COUNT(*) AS payment_count,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount,
        COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_count,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_count
      FROM pago p
      WHERE p.comunidad_id = ?
      GROUP BY YEAR(p.fecha), MONTH(p.fecha), DATE_FORMAT(p.fecha, '%Y-%m')
      ORDER BY year DESC, month DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por período:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por período' });
  }
});

// =========================================
// 3. PAGOS PENDIENTES Y APLICACIONES
// =========================================

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/pendientes:
 *   get:
 *     tags: [Pagos]
 *     summary: Pagos pendientes de aplicación completa
 */
router.get('/comunidad/:comunidadId/pendientes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        p.monto AS total_payment,
        COALESCE(SUM(pa.monto), 0) AS applied_amount,
        (p.monto - COALESCE(SUM(pa.monto), 0)) AS remaining_amount,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        p.referencia AS reference
      FROM pago p
      LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE p.comunidad_id = ?
        AND p.estado = 'pendiente'
      GROUP BY p.id, p.monto, p.fecha, u.codigo, pers.nombres, pers.apellidos, p.referencia
      HAVING remaining_amount > 0
      ORDER BY p.fecha DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener pagos pendientes:', error);
    res.status(500).json({ error: 'Error al obtener pagos pendientes' });
  }
});

/**
 * @openapi
 * /api/pagos/{id}/aplicaciones:
 *   get:
 *     tags: [Pagos]
 *     summary: Ver cómo se aplicó un pago a cargos
 */
router.get('/:id/aplicaciones', authenticate, async (req, res) => {
  try {
    const pagoId = Number(req.params.id);

    const query = `
      SELECT
        pa.id,
        pa.monto AS applied_amount,
        pa.prioridad,
        ccu.id AS charge_id,
        CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS charge_code,
        ccu.monto_total AS charge_total,
        ccu.saldo AS charge_balance,
        egc.periodo AS period,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS due_date,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name
      FROM pago_aplicacion pa
      JOIN cuenta_cobro_unidad ccu ON pa.cargo_unidad_id = ccu.id
      LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      LEFT JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN pago p_ref ON pa.pago_id = p_ref.id
      LEFT JOIN persona pers ON p_ref.persona_id = pers.id
      WHERE pa.pago_id = ?
      ORDER BY pa.prioridad, pa.id
    `;

    const [rows] = await db.query(query, [pagoId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener aplicaciones de pago:', error);
    res.status(500).json({ error: 'Error al obtener aplicaciones' });
  }
});

// =========================================
// 4. HISTORIAL Y CONSULTAS POR UNIDAD/RESIDENTE
// =========================================

/**
 * @openapi
 * /api/pagos/unidad/{unidadId}/historial:
 *   get:
 *     tags: [Pagos]
 *     summary: Historial completo de pagos de una unidad
 */
router.get('/unidad/:unidadId/historial', authenticate, async (req, res) => {
  try {
    const unidadId = Number(req.params.unidadId);

    const query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        p.monto AS amount,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        p.referencia AS reference,
        COALESCE(SUM(pa.monto), 0) AS applied_amount
      FROM pago p
      LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
      WHERE p.unidad_id = ?
      GROUP BY p.id, p.fecha, p.monto, p.estado, p.medio, p.referencia
      ORDER BY p.fecha DESC
    `;

    const [rows] = await db.query(query, [unidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/por-residente:
 *   get:
 *     tags: [Pagos]
 *     summary: Resumen de pagos por residente
 */
router.get('/comunidad/:comunidadId/por-residente', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        pers.id AS resident_id,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        pers.email AS resident_email,
        u.codigo AS unit_number,
        COUNT(p.id) AS total_payments,
        COALESCE(SUM(p.monto), 0) AS total_paid,
        COALESCE(AVG(p.monto), 0) AS average_payment,
        MAX(p.fecha) AS last_payment_date,
        COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_payments,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_payments,
        COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_payments
      FROM persona pers
      LEFT JOIN titulares_unidad tu ON pers.id = tu.persona_id 
        AND tu.tipo = 'propietario' 
        AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN unidad u ON tu.unidad_id = u.id
      LEFT JOIN pago p ON pers.id = p.persona_id
      WHERE u.comunidad_id = ?
      GROUP BY pers.id, pers.nombres, pers.apellidos, pers.email, u.codigo
      HAVING COUNT(p.id) > 0
      ORDER BY total_paid DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener pagos por residente:', error);
    res.status(500).json({ error: 'Error al obtener pagos por residente' });
  }
});

// =========================================
// 5. CONCILIACIÓN BANCARIA
// =========================================

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/conciliacion:
 *   get:
 *     tags: [Pagos]
 *     summary: Movimientos bancarios para conciliación
 */
router.get('/comunidad/:comunidadId/conciliacion', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        cb.id,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m-%d') AS movement_date,
        cb.glosa,
        cb.monto,
        COALESCE(p.medio, 'No Aplicable') AS type,
        cb.referencia AS bank_reference,
        p.id AS payment_id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS payment_code,
        p.referencia AS payment_reference,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pending'
          WHEN cb.estado = 'conciliado' THEN 'reconciled'
          WHEN cb.estado = 'descartado' THEN 'discarded'
          ELSE 'pending'
        END AS reconciliation_status
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.comunidad_id = ?
      ORDER BY cb.fecha_mov DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener conciliación bancaria:', error);
    res.status(500).json({ error: 'Error al obtener conciliación bancaria' });
  }
});

// =========================================
// 6. WEBHOOKS
// =========================================

/**
 * @openapi
 * /api/pagos/{id}/webhooks:
 *   get:
 *     tags: [Pagos]
 *     summary: Webhooks recibidos para un pago
 */
router.get('/:id/webhooks', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const pagoId = Number(req.params.id);

    const query = `
      SELECT
        wp.id,
        wp.proveedor AS evento,
        wp.payload_json AS payload,
        wp.procesado,
        DATE_FORMAT(wp.fecha_recepcion, '%Y-%m-%d %H:%i:%s') AS received_at,
        wp.created_at
      FROM webhook_pago wp
      WHERE wp.pago_id = ?
      ORDER BY wp.fecha_recepcion DESC
    `;

    const [rows] = await db.query(query, [pagoId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener webhooks:', error);
    res.status(500).json({ error: 'Error al obtener webhooks' });
  }
});

// =========================================
// 7. VALIDACIONES
// =========================================

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}/validar:
 *   get:
 *     tags: [Pagos]
 *     summary: Validar integridad de pagos
 */
router.get('/comunidad/:comunidadId/validar', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        p.id,
        CASE
          WHEN p.comunidad_id IS NULL THEN 'Missing community reference'
          WHEN p.monto <= 0 THEN 'Invalid amount'
          WHEN p.fecha IS NULL THEN 'Missing payment date'
          WHEN p.estado NOT IN ('pendiente', 'aplicado', 'reversado') THEN 'Invalid status'
          ELSE 'Valid'
        END AS validation_status,
        p.monto,
        p.fecha,
        p.estado,
        COUNT(pa.id) AS application_count,
        COALESCE(SUM(pa.monto), 0) AS applied_amount
      FROM pago p
      LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
      WHERE p.comunidad_id = ?
      GROUP BY p.id, p.comunidad_id, p.monto, p.fecha, p.estado
      HAVING validation_status != 'Valid'
      ORDER BY p.id
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al validar pagos:', error);
    res.status(500).json({ error: 'Error al validar pagos' });
  }
});

// =========================================
// 8. CRUD BÁSICO
// =========================================

/**
 * @openapi
 * /api/pagos/comunidad/{comunidadId}:
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar un nuevo pago
 */
router.post('/comunidad/:comunidadId', [
  authenticate,
  requireCommunity('comunidadId'),
  body('monto').isNumeric(),
  body('fecha').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comunidadId = Number(req.params.comunidadId);
    const { unidad_id, persona_id, fecha, monto, medio, referencia, comprobante_num } = req.body;

    const [result] = await db.query(
      'INSERT INTO pago (comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia, comprobante_num) VALUES (?,?,?,?,?,?,?,?)',
      [comunidadId, unidad_id || null, persona_id || null, fecha, monto, medio || null, referencia || null, comprobante_num || null]
    );

    const [row] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE id = ? LIMIT 1', [result.insertId]);

    res.status(201).json(row[0]);
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error al crear pago' });
  }
});

/**
 * @openapi
 * /api/pagos/{id}/aplicar:
 *   post:
 *     tags: [Pagos]
 *     summary: Aplicar un pago a cuentas de cobro específicas
 */
router.post('/:id/aplicar', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  const pagoId = Number(req.params.id);
  const assignments = req.body.assignments || [];

  if (!Array.isArray(assignments) || !assignments.length) {
    return res.status(400).json({ error: 'Se requiere array de assignments' });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [pRows] = await conn.query('SELECT comunidad_id, monto, estado FROM pago WHERE id = ? LIMIT 1', [pagoId]);

    if (!pRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const pago = pRows[0];

    if (pago.estado === 'reversado') {
      await conn.rollback();
      return res.status(400).json({ error: 'Pago reversado no puede ser aplicado' });
    }

    for (const a of assignments) {
      const cuentaId = a.cuenta_cobro_unidad_id || a.cargo_unidad_id;

      if (!cuentaId || (typeof a.monto !== 'number' && typeof a.monto !== 'string')) {
        await conn.rollback();
        return res.status(400).json({ error: 'Formato de assignment inválido' });
      }

      const monto = Number(a.monto);

      if (monto <= 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
      }

      const [cRows] = await conn.query('SELECT saldo FROM cuenta_cobro_unidad WHERE id = ? LIMIT 1 FOR UPDATE', [cuentaId]);

      if (!cRows.length) {
        await conn.rollback();
        return res.status(404).json({ error: `Cuenta ${cuentaId} no encontrada` });
      }

      const cargoSaldo = Number(cRows[0].saldo || 0);

      if (monto > cargoSaldo) {
        await conn.rollback();
        return res.status(400).json({ error: `El monto excede el saldo de la cuenta ${cuentaId}` });
      }

      await conn.query('INSERT INTO pago_aplicacion (pago_id, cargo_unidad_id, monto) VALUES (?,?,?)', [pagoId, cuentaId, monto]);
      await conn.query('UPDATE cuenta_cobro_unidad SET saldo = saldo - ? WHERE id = ?', [monto, cuentaId]);
    }

    const [paRows] = await conn.query('SELECT SUM(monto) as total FROM pago_aplicacion WHERE pago_id = ?', [pagoId]);
    const applied = Number((paRows[0] && paRows[0].total) || 0);

    let newEstado = 'pendiente';
    if (applied >= Number(pago.monto)) {
      newEstado = 'aplicado';
    } else if (applied > 0) {
      newEstado = 'aplicado';
    }

    await conn.query('UPDATE pago SET estado = ? WHERE id = ?', [newEstado, pagoId]);

    await conn.commit();

    res.json({ ok: true, pago_id: pagoId, assigned: applied });
  } catch (error) {
    console.error('Error al aplicar pago:', error);
    try {
      await conn.rollback();
    } catch (e) {
      console.error('Error al hacer rollback:', e);
    }
    res.status(500).json({ error: 'Error al aplicar pago' });
  } finally {
    try {
      conn.release();
    } catch (e) {
      console.error('Error al liberar conexión:', e);
    }
  }
});

/**
 * @openapi
 * /api/pagos/{id}/reversar:
 *   post:
 *     tags: [Pagos]
 *     summary: Reversar un pago aplicado
 */
router.post('/:id/reversar', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  const pagoId = Number(req.params.id);
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [pRows] = await conn.query('SELECT estado FROM pago WHERE id = ? LIMIT 1', [pagoId]);

    if (!pRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    if (pRows[0].estado === 'reversado') {
      await conn.rollback();
      return res.status(400).json({ error: 'Pago ya está reversado' });
    }

    // Revertir aplicaciones
    const [aplicaciones] = await conn.query('SELECT cargo_unidad_id, monto FROM pago_aplicacion WHERE pago_id = ?', [pagoId]);

    for (const ap of aplicaciones) {
      await conn.query('UPDATE cuenta_cobro_unidad SET saldo = saldo + ? WHERE id = ?', [ap.monto, ap.cargo_unidad_id]);
    }

    await conn.query('DELETE FROM pago_aplicacion WHERE pago_id = ?', [pagoId]);
    await conn.query('UPDATE pago SET estado = ? WHERE id = ?', ['reversado', pagoId]);

    await conn.commit();

    res.json({ ok: true, pago_id: pagoId, message: 'Pago reversado exitosamente' });
  } catch (error) {
    console.error('Error al reversar pago:', error);
    try {
      await conn.rollback();
    } catch (e) {
      console.error('Error al hacer rollback:', e);
    }
    res.status(500).json({ error: 'Error al reversar pago' });
  } finally {
    try {
      conn.release();
    } catch (e) {
      console.error('Error al liberar conexión:', e);
    }
  }
});

module.exports = router;
