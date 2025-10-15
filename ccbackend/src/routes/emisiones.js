const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   - name: Emisiones
 *     description: |
 *       Gestión de emisiones de gastos comunes mensuales.
 *       
 *       **Cambios importantes**:
 *       - La tabla `emision_gasto_comun` ahora se llama `emision_gastos_comunes`
 *       - Los detalles se guardan en `detalle_emision` (antes `emision_gasto_comun_detalle`)
 *       
 *       Una emisión consolida todos los gastos del mes y genera las cuentas de cobro para cada unidad.
 */

/**
 * @swagger
 * /emisiones/comunidad/{comunidadId}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Listar emisiones de una comunidad
 *     description: |
 *       Obtiene el historial de emisiones de gastos comunes de una comunidad.
 *       Incluye información del período, monto total y estado de cada emisión.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-03"
 *                   fecha_emision:
 *                     type: string
 *                     format: date
 *                   monto_total:
 *                     type: number
 *                     description: Suma de todos los gastos del período
 *                   estado:
 *                     type: string
 *                     enum: [borrador, emitida, cerrada]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId; const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, periodo, estado, fecha_vencimiento FROM emision_gastos_comunes WHERE comunidad_id = ? ORDER BY periodo DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});
/**
 * @swagger
 * /emisiones/comunidad/{comunidadId}/count:
 *   get:
 *     tags: [Emisiones]
 *     summary: Contar emisiones de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Total de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 */
// count total emisiones for comunidad (pagination)
router.get('/comunidad/:comunidadId/count', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  try {
    const [[row]] = await db.query('SELECT COUNT(DISTINCT egc.id) as total FROM emision_gastos_comunes egc WHERE egc.comunidad_id = ?', [comunidadId]);
    res.json({ total: row.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /comunidades/{comunidadId}/emisiones:
 *   post:
 *     tags: [Emisiones]
 *     summary: Crear una emisión (gasto común)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodo:
 *                 type: string
 *               fecha_vencimiento:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('periodo').notEmpty(), body('fecha_vencimiento').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = req.params.comunidadId; const { periodo, fecha_vencimiento, observaciones } = req.body;
  try { const [result] = await db.query('INSERT INTO emision_gastos_comunes (comunidad_id, periodo, fecha_vencimiento, observaciones) VALUES (?,?,?,?)', [comunidadId, periodo, fecha_vencimiento, observaciones || null]); const [row] = await db.query('SELECT id, periodo, estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

/**
 * @swagger
 * /emisiones/{id}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener emisión por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Emisión
 *       404:
 *         description: No encontrado
 */
router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

// enhanced get by id (include totals, interest params)
/**
 * @swagger
 * /emisiones/{id}/detalle-completo:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener emisión con totales y parámetros de cobranza
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Emisión detallada
 *       404:
 *         description: No encontrado
 */
router.get('/:id/detalle-completo', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'gastos_comunes'
        END as tipo,
        CASE
          WHEN egc.estado = 'borrador' THEN 'draft'
          WHEN egc.estado = 'emitido' THEN 'sent'
          WHEN egc.estado = 'cerrado' THEN 'paid'
          WHEN egc.estado = 'anulado' THEN 'cancelled'
          ELSE 'ready'
        END as status,
        DATE_FORMAT(egc.created_at, '%Y-%m-%d') as issueDate,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as dueDate,
        COALESCE(SUM(ccu.monto_total), 0) as totalAmount,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as paidAmount,
        COUNT(DISTINCT ccu.unidad_id) as unitCount,
        egc.observaciones as description,
        c.razon_social as communityName,
        CASE WHEN egc.periodo LIKE '%Interes%' THEN 1 ELSE 0 END as hasInterest,
        COALESCE(pc.tasa_mora_mensual, 2.0) as interestRate,
        COALESCE(pc.dias_gracia, 5) as gracePeriod,
        egc.created_at,
        egc.updated_at
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      LEFT JOIN parametros_cobranza pc ON c.id = pc.comunidad_id
      WHERE egc.id = ?
      GROUP BY egc.id, egc.periodo, egc.estado, egc.created_at, egc.fecha_vencimiento, egc.observaciones, c.razon_social, pc.tasa_mora_mensual, pc.dias_gracia, egc.updated_at
      LIMIT 1
    `, [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.estado) return res.status(400).json({ error: 'estado required' }); try { await db.query('UPDATE emision_gastos_comunes SET estado = ? WHERE id = ?', [req.body.estado, id]); const [rows] = await db.query('SELECT id, periodo, estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// add detalle
router.post('/:id/detalles', [authenticate, authorize('admin','superadmin'), body('categoria_id').isInt(), body('monto').isNumeric(), body('regla_prorrateo').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const emisionId = req.params.id; const { gasto_id, categoria_id, monto, regla_prorrateo, metadata_json } = req.body;
  try { const [result] = await db.query('INSERT INTO detalle_emision_gastos (emision_id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json) VALUES (?,?,?,?,?,?)', [emisionId, gasto_id || null, categoria_id, monto, regla_prorrateo, metadata_json || null]); const [row] = await db.query('SELECT id, categoria_id, monto, regla_prorrateo FROM detalle_emision_gastos WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

/**
 * @swagger
 * /emisiones/{id}/detalles:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener conceptos/prorrateo de una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de detalles
 */

// obtener conceptos/prorrateo de una emision
router.get('/:id/detalles', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        deg.id,
        cg.nombre as name,
        cg.nombre as description,
        deg.monto as amount,
        CASE
          WHEN deg.regla_prorrateo = 'coeficiente' THEN 'proportional'
          WHEN deg.regla_prorrateo = 'partes_iguales' THEN 'equal'
          WHEN deg.regla_prorrateo = 'consumo' THEN 'custom'
          WHEN deg.regla_prorrateo = 'fijo_por_unidad' THEN 'custom'
          ELSE 'proportional'
        END as distributionType,
        cg.nombre as category,
        deg.created_at
      FROM detalle_emision_gastos deg
      JOIN categoria_gasto cg ON deg.categoria_id = cg.id
      WHERE deg.emision_id = ?
      ORDER BY deg.created_at
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/gastos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener gastos incluidos en una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de gastos
 */
// obtener gastos incluidos en una emision
router.get('/:id/gastos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        g.id,
        g.glosa as description,
        deg.monto as amount,
        cg.nombre as category,
        p.razon_social as supplier,
        DATE_FORMAT(g.fecha, '%Y-%m-%d') as date,
        COALESCE(dc.folio, CONCAT('Gasto #', g.id)) as document,
        g.created_at
      FROM detalle_emision_gastos deg
      LEFT JOIN gasto g ON deg.gasto_id = g.id
      JOIN categoria_gasto cg ON deg.categoria_id = cg.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE deg.emision_id = ? AND deg.gasto_id IS NOT NULL
      ORDER BY g.fecha DESC
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/unidades:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener unidades y su prorrateo para una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de unidades con montos
 */
// obtener unidades y prorrateo de una emision
router.get('/:id/unidades', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.codigo as number,
        CASE
          WHEN u.m2_utiles > 0 THEN 'Departamento'
          WHEN u.nro_estacionamiento IS NOT NULL THEN 'Estacionamiento'
          WHEN u.nro_bodega IS NOT NULL THEN 'Bodega'
          ELSE 'Unidad'
        END as type,
        COALESCE(
          CONCAT(p.nombres, ' ', p.apellidos),
          'Sin asignar'
        ) as owner,
        COALESCE(
          p.email,
          ''
        ) as contact,
        u.alicuota as participation,
        ccu.monto_total as totalAmount,
        (ccu.monto_total - ccu.saldo) as paidAmount,
        CASE
          WHEN ccu.estado = 'pagado' THEN 'paid'
          WHEN ccu.estado = 'parcial' THEN 'partial'
          WHEN ccu.estado = 'vencido' THEN 'pending'
          ELSE 'pending'
        END as status,
        ccu.created_at
      FROM cuenta_cobro_unidad ccu
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE ccu.emision_id = ?
      ORDER BY u.codigo
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/pagos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener pagos aplicados para una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
// obtener pagos realizados para una emision
router.get('/:id/pagos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') as date,
        pa.monto as amount,
        CASE
          WHEN p.medio = 'transferencia' THEN 'Transferencia'
          WHEN p.medio = 'webpay' THEN 'WebPay'
          WHEN p.medio = 'khipu' THEN 'Khipu'
          WHEN p.medio = 'servipag' THEN 'Servipag'
          WHEN p.medio = 'efectivo' THEN 'Efectivo'
          ELSE p.medio
        END as method,
        p.referencia as reference,
        u.codigo as unit,
        CASE
          WHEN p.estado = 'aplicado' THEN 'confirmed'
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'reversado' THEN 'rejected'
          ELSE 'pending'
        END as status,
        p.created_at
      FROM pago_aplicacion pa
      JOIN pago p ON pa.pago_id = p.id
      JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
      JOIN unidad u ON ccu.unidad_id = u.id
      WHERE ccu.emision_id = ?
      ORDER BY p.fecha DESC, p.created_at DESC
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/auditoria:
 *   get:
 *     tags: [Emisiones]
 *     summary: Historial (auditoría) de una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de auditoría
 */
// historial de cambios (auditoria)
router.get('/:id/auditoria', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        a.id,
        DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as date,
        CASE
          WHEN a.accion = 'INSERT' THEN 'Emisión creada'
          WHEN a.accion = 'UPDATE' THEN 'Emisión actualizada'
          WHEN a.accion = 'DELETE' THEN 'Emisión eliminada'
          ELSE CONCAT('Acción: ', a.accion)
        END as action,
        COALESCE(u.username, 'Sistema') as user,
        CASE
          WHEN a.accion = 'INSERT' THEN 'Se creó la emisión'
          WHEN a.accion = 'UPDATE' THEN 'Se modificaron datos de la emisión'
          WHEN a.accion = 'DELETE' THEN 'Se eliminó la emisión'
          ELSE 'Cambio en emisión'
        END as description,
        a.created_at
      FROM auditoria a
      LEFT JOIN usuario u ON a.usuario_id = u.id
      WHERE a.tabla = 'emision_gastos_comunes' AND a.registro_id = ?
      ORDER BY a.created_at DESC
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}:
 *   delete:
 *     tags: [Emisiones]
 *     summary: Eliminar emisión y dependencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Eliminado con éxito
 */
// eliminar emision y dependencias (admin)
router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const emisionId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // delete pago_aplicacion
    await conn.query('DELETE pa FROM pago_aplicacion pa JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id WHERE ccu.emision_id = ?', [emisionId]);
    // delete cuenta_cobro_unidad
    await conn.query('DELETE FROM cuenta_cobro_unidad WHERE emision_id = ?', [emisionId]);
    // delete detalle_emision_gastos
    await conn.query('DELETE FROM detalle_emision_gastos WHERE emision_id = ?', [emisionId]);
    // delete emision
    await conn.query('DELETE FROM emision_gastos_comunes WHERE id = ?', [emisionId]);
    await conn.commit();
    res.json({ ok: true });
    } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch (e) { console.error(e); }
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch (e) { console.error(e); }
  }
});

/**
 * @swagger
 * /emisiones/estadisticas/general:
 *   get:
 *     tags: [Emisiones]
 *     summary: Estadísticas generales de emisiones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 */
// estadisticas: generales
router.get('/estadisticas/general', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total_emisiones,
        SUM(CASE WHEN estado = 'emitido' THEN 1 ELSE 0 END) as emitidas,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerradas,
        SUM(CASE WHEN estado = 'anulado' THEN 1 ELSE 0 END) as anuladas
      FROM emision_gastos_comunes
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/estadisticas/por-mes:
 *   get:
 *     tags: [Emisiones]
 *     summary: Emisiones por mes y estado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista por mes
 */
// estadisticas: por mes y estado
router.get('/estadisticas/por-mes', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as mes,
        estado,
        COUNT(*) as cantidad
      FROM emision_gastos_comunes
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), estado
      ORDER BY mes DESC, estado
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/estadisticas/cobranza:
 *   get:
 *     tags: [Emisiones]
 *     summary: Cobranza por emisión
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cobranza por emisión
 */
// estadisticas: cobranza por emision
router.get('/estadisticas/cobranza', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        c.razon_social as comunidad,
        SUM(ccu.monto_total) as total_emitido,
        SUM(ccu.monto_total - ccu.saldo) as total_cobrado,
        ROUND((SUM(ccu.monto_total - ccu.saldo) / SUM(ccu.monto_total)) * 100, 2) as porcentaje_cobranza,
        COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as unidades_pagadas,
        COUNT(ccu.unidad_id) as total_unidades
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      WHERE egc.estado IN ('emitido', 'cerrado')
      GROUP BY egc.id, egc.periodo, c.razon_social
      ORDER BY egc.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/existencia:
 *   get:
 *     tags: [Emisiones]
 *     summary: Verificar existencia de emisión para periodo y comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Indica si existe o no
 */
// validaciones
router.get('/validar/existencia', authenticate, async (req, res) => {
  const { comunidad_id, periodo } = req.query;
  if (!comunidad_id || !periodo) return res.status(400).json({ error: 'comunidad_id and periodo required' });
  try {
    const [[row]] = await db.query('SELECT COUNT(*) as existe_emision FROM emision_gastos_comunes WHERE comunidad_id = ? AND periodo = ?', [comunidad_id, periodo]);
    res.json({ existe_emision: row.existe_emision });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/gastos/{id}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Validar gastos de una emisión
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/gastos/:id', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        deg.emision_id,
        COUNT(*) as total_gastos_incluidos,
        SUM(CASE WHEN g.id IS NULL THEN 1 ELSE 0 END) as gastos_inexistentes
      FROM detalle_emision_gastos deg
      LEFT JOIN gasto g ON deg.gasto_id = g.id
      WHERE deg.emision_id = ?
      GROUP BY deg.emision_id
    `, [emisionId]);
    res.json(rows.length ? rows[0] : { total_gastos_incluidos: 0, gastos_inexistentes: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/cuentas/{id}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Validar integridad de cuentas de cobro
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/cuentas/:id', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        'cuentas_cobro' as tipo_verificacion,
        COUNT(*) as total_registros,
        SUM(CASE WHEN ccu.monto_total <= 0 THEN 1 ELSE 0 END) as montos_invalidos,
        SUM(CASE WHEN ccu.saldo > ccu.monto_total THEN 1 ELSE 0 END) as saldos_invalidos
      FROM cuenta_cobro_unidad ccu
      WHERE ccu.emision_id = ?
    `, [emisionId]);
    res.json(rows[0] || { total_registros: 0, montos_invalidos: 0, saldos_invalidos: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/cobertura/{comunidadId}/{emisionId}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Validar cobertura de unidades con cuentas de cobro
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: emisionId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/cobertura/:comunidadId/:emisionId', authenticate, async (req, res) => {
  const { comunidadId, emisionId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        'cobertura_unidades' as tipo_verificacion,
        COUNT(DISTINCT u.id) as unidades_activas,
        COUNT(DISTINCT ccu.unidad_id) as unidades_con_cobro,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT ccu.unidad_id) as unidades_faltantes
      FROM unidad u
      LEFT JOIN cuenta_cobro_unidad ccu ON u.id = ccu.unidad_id AND ccu.emision_id = ?
      WHERE u.activa = 1 AND u.comunidad_id = ?
    `, [emisionId, comunidadId]);
    res.json(rows[0] || { unidades_activas: 0, unidades_con_cobro: 0, unidades_faltantes: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// preview prorrateo - stub: return example distribution
router.get('/:id/previsualizar-prorrateo', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    // load emision and detalles
    const [emRows] = await db.query('SELECT comunidad_id, periodo FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) return res.status(404).json({ error: 'emision not found' });
    const comunidadId = emRows[0].comunidad_id;
    const [detalles] = await db.query('SELECT id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json FROM detalle_emision_gastos WHERE emision_id = ?', [emisionId]);

    // load unidades for comunidad
    const [unidades] = await db.query('SELECT id, codigo, alicuota FROM unidad WHERE comunidad_id = ? AND activa = 1', [comunidadId]);
    if (!unidades.length) return res.status(200).json({ preview: [], note: 'no active unidades' });

    const totalAlicuota = unidades.reduce((s,u) => s + Number(u.alicuota || 0), 0) || 0;
    const nUnits = unidades.length;

    // prepare preview structure: map unidadId => { detalleId -> monto }
    const preview = unidades.map(u => ({ unidad_id: u.id, codigo: u.codigo, distribucion: [], total: 0 }));

    for (const d of detalles) {
      const rule = d.regla_prorrateo || 'partes_iguales';
      if (rule === 'consumo') {
        // consumption requires medidor readings — mark as requires data
        // For now we cannot compute consumption-based prorrateo without readings.
        return res.json({ preview: [], note: 'consumo-based prorrateo requires medidor data; not implemented in preview' });
      }

      if (rule === 'coeficiente') {
        // distribute by alicuota proportionally
        for (const p of preview) {
          const unidad = unidades.find(u => u.id === p.unidad_id);
          const share = totalAlicuota > 0 ? (Number(unidad.alicuota || 0) / totalAlicuota) * Number(d.monto) : 0;
          const val = Number(share.toFixed(2));
          p.distribucion.push({ detalle_id: d.id, monto: val });
          p.total = Number((p.total + val).toFixed(2));
        }
      } else if (rule === 'fijo_por_unidad' || rule === 'partes_iguales') {
        // equal split among units
        const per = Number((Number(d.monto) / nUnits).toFixed(2));
        // adjust rounding remainder to first unit
        let remainder = Number(d.monto) - per * nUnits;
        for (let i = 0; i < preview.length; i++) {
          let val = per;
          if (remainder !== 0 && i === 0) { val = Number((val + remainder).toFixed(2)); }
          preview[i].distribucion.push({ detalle_id: d.id, monto: val });
          preview[i].total = Number((preview[i].total + val).toFixed(2));
        }
      } else {
        // unknown rule: skip
        continue;
      }
    }

    res.json({ preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// generar cargos - stub
router.post('/:id/generar-cargos', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const emisionId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [emRows] = await conn.query('SELECT comunidad_id FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) { await conn.rollback(); return res.status(404).json({ error: 'emision not found' }); }
    const comunidadId = emRows[0].comunidad_id;

    const [detalles] = await conn.query('SELECT id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json FROM detalle_emision_gastos WHERE emision_id = ?', [emisionId]);
    const [unidades] = await conn.query('SELECT id, codigo, alicuota FROM unidad WHERE comunidad_id = ? AND activa = 1', [comunidadId]);
    if (!unidades.length) { await conn.rollback(); return res.status(400).json({ error: 'no active unidades' }); }

    // compute preview using same logic as preview endpoint
    const totalAlicuota = unidades.reduce((s,u) => s + Number(u.alicuota || 0), 0) || 0;
    const nUnits = unidades.length;
    const distrib = unidades.map(u => ({ unidad_id: u.id, detalles: [], total: 0 }));

    for (const d of detalles) {
      const rule = d.regla_prorrateo || 'partes_iguales';
      if (rule === 'consumo') {
        await conn.rollback();
        return res.status(400).json({ error: 'consumo-based prorrateo requires medidor data; not supported in generate' });
      }
      if (rule === 'coeficiente') {
        for (const p of distrib) {
          const unidad = unidades.find(u => u.id === p.unidad_id);
          const share = totalAlicuota > 0 ? (Number(unidad.alicuota || 0) / totalAlicuota) * Number(d.monto) : 0;
          const val = Number(share.toFixed(2));
          p.detalles.push({ detalle_id: d.id, monto: val, categoria_id: d.categoria_id, gasto_id: d.gasto_id });
          p.total = Number((p.total + val).toFixed(2));
        }
      } else if (rule === 'fijo_por_unidad' || rule === 'partes_iguales') {
        const per = Number((Number(d.monto) / nUnits).toFixed(2));
        let remainder = Number(d.monto) - per * nUnits;
        for (let i = 0; i < distrib.length; i++) {
          let val = per;
          if (remainder !== 0 && i === 0) { val = Number((val + remainder).toFixed(2)); }
          distrib[i].detalles.push({ detalle_id: d.id, monto: val, categoria_id: d.categoria_id, gasto_id: d.gasto_id });
          distrib[i].total = Number((distrib[i].total + val).toFixed(2));
        }
      }
    }

    // create cuenta_cobro_unidad rows and detalle_cuenta_unidad
    const created = [];
    for (const d of distrib) {
      const [r] = await conn.query('INSERT INTO cuenta_cobro_unidad (emision_id, comunidad_id, unidad_id, monto_total, saldo) VALUES (?,?,?,?,?)', [emisionId, comunidadId, d.unidad_id, d.total, d.total]);
      const cuentaId = r.insertId;
      for (const det of d.detalles) {
        await conn.query('INSERT INTO detalle_cuenta_unidad (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, origen_id, iva_incluido) VALUES (?,?,?,?,?,?,?)', [cuentaId, det.categoria_id, `detalle ${det.detalle_id}`, det.monto, 'gasto', det.gasto_id || null, 1]);
      }
      created.push({ unidad_id: d.unidad_id, cuenta_cobro_unidad_id: cuentaId, monto_total: d.total });
    }

    await conn.commit();
    res.status(201).json({ ok: true, created });
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch (e) { console.error(e); }
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch (e) { console.error(e); }
  }
});

module.exports = router;
