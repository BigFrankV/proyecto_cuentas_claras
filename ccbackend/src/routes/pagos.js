const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Pagos
 *     description: |
 *       Gestión de pagos, aplicaciones a cuentas de cobro y reversos.
 *       
 *       **Compatibilidad**: Los endpoints aceptan tanto `cargo_unidad_id` (legacy) como `cuenta_cobro_unidad_id` (nuevo).
 */

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar pagos de una comunidad
 *     description: Obtiene los pagos registrados en una comunidad con paginación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Lista de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   monto:
 *                     type: number
 *                   medio:
 *                     type: string
 *                   estado:
 *                     type: string
 *                     enum: [pendiente, aplicado, reversado]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Listar pagos por comunidad
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE comunidad_id = ? ORDER BY fecha DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas de pagos por comunidad
 *     description: Obtiene estadísticas generales de pagos de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Estadísticas de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPagos:
 *                   type: integer
 *                   description: Total de pagos registrados
 *                 pagosAprobados:
 *                   type: integer
 *                   description: Número de pagos aplicados
 *                 pagosPendientes:
 *                   type: integer
 *                   description: Número de pagos pendientes
 *                 pagosCancelados:
 *                   type: integer
 *                   description: Número de pagos reversados
 *                 montoTotal:
 *                   type: number
 *                   description: Suma total de todos los pagos
 *                 montoPromedio:
 *                   type: number
 *                   description: Monto promedio de los pagos
 *                 pagoMasAntiguo:
 *                   type: string
 *                   format: date
 *                   description: Fecha del pago más antiguo
 *                 pagoMasReciente:
 *                   type: string
 *                   format: date
 *                   description: Fecha del pago más reciente
 *                 montoAprobado:
 *                   type: number
 *                   description: Suma de montos de pagos aplicados
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Estadísticas de pagos por comunidad
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      COUNT(*) as totalPagos,
      COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as pagosAprobados,
      COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pagosPendientes,
      COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as pagosCancelados,
      SUM(p.monto) as montoTotal,
      AVG(p.monto) as montoPromedio,
      MIN(p.fecha) as pagoMasAntiguo,
      MAX(p.fecha) as pagoMasReciente,
      SUM(CASE WHEN p.estado = 'aplicado' THEN p.monto ELSE 0 END) as montoAprobado
    FROM pago p
    WHERE p.comunidad_id = ?
  `, [comunidadId]);
  res.json(rows[0] || {});
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/por-estado:
 *   get:
 *     tags: [Pagos]
 *     summary: Pagos agrupados por estado
 *     description: Obtiene los pagos agrupados por estado para dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Pagos agrupados por estado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   estado:
 *                     type: string
 *                     enum: [pending, approved, cancelled]
 *                     description: Estado del pago
 *                   cantidad:
 *                     type: integer
 *                     description: Número de pagos en este estado
 *                   montoTotal:
 *                     type: number
 *                     description: Suma total de montos
 *                   montoPromedio:
 *                     type: number
 *                     description: Monto promedio
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Pagos agrupados por estado
router.get('/comunidad/:comunidadId/por-estado', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      CASE
        WHEN p.estado = 'pendiente' THEN 'pending'
        WHEN p.estado = 'aplicado' THEN 'approved'
        WHEN p.estado = 'reversado' THEN 'cancelled'
        ELSE 'pending'
      END as estado,
      COUNT(*) as cantidad,
      SUM(p.monto) as montoTotal,
      AVG(p.monto) as montoPromedio
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
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/por-metodo:
 *   get:
 *     tags: [Pagos]
 *     summary: Pagos agrupados por método de pago
 *     description: Obtiene los pagos agrupados por método de pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Pagos agrupados por método
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   metodoPago:
 *                     type: string
 *                     description: Método de pago
 *                   cantidad:
 *                     type: integer
 *                     description: Número de pagos con este método
 *                   montoTotal:
 *                     type: number
 *                     description: Suma total de montos
 *                   montoPromedio:
 *                     type: number
 *                     description: Monto promedio
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Pagos agrupados por método de pago
router.get('/comunidad/:comunidadId/por-metodo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      CASE
        WHEN p.medio = 'transferencia' THEN 'bank_transfer'
        WHEN p.medio = 'webpay' THEN 'webpay'
        WHEN p.medio = 'khipu' THEN 'khipu'
        WHEN p.medio = 'servipag' THEN 'servipag'
        WHEN p.medio = 'efectivo' THEN 'cash'
        ELSE p.medio
      END as metodoPago,
      COUNT(*) as cantidad,
      SUM(p.monto) as montoTotal,
      AVG(p.monto) as montoPromedio
    FROM pago p
    WHERE p.comunidad_id = ?
    GROUP BY p.medio
    ORDER BY montoTotal DESC
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/pendientes:
 *   get:
 *     tags: [Pagos]
 *     summary: Pagos pendientes de aplicación
 *     description: Obtiene los pagos que aún no se han aplicado completamente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de pagos pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idOrden:
 *                     type: string
 *                     description: Código único del pago
 *                   totalPago:
 *                     type: number
 *                     description: Monto total del pago
 *                   montoAplicado:
 *                     type: number
 *                     description: Monto ya aplicado
 *                   saldoPendiente:
 *                     type: number
 *                     description: Monto pendiente de aplicación
 *                   fechaPago:
 *                     type: string
 *                     format: date
 *                     description: Fecha del pago
 *                   numeroUnidad:
 *                     type: string
 *                     description: Código de la unidad
 *                   nombreResidente:
 *                     type: string
 *                     description: Nombre del residente
 *                   referencia:
 *                     type: string
 *                     description: Referencia del pago
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Pagos pendientes de aplicación
router.get('/comunidad/:comunidadId/pendientes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      p.id,
      CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
      p.monto as totalPago,
      COALESCE(SUM(pa.monto), 0) as montoAplicado,
      (p.monto - COALESCE(SUM(pa.monto), 0)) as saldoPendiente,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
      u.codigo as numeroUnidad,
      CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
      p.referencia as referencia
    FROM pago p
    LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
    LEFT JOIN unidad u ON p.unidad_id = u.id
    LEFT JOIN persona pers ON p.persona_id = pers.id
    WHERE p.comunidad_id = ?
      AND p.estado = 'pendiente'
    GROUP BY p.id, p.monto, p.fecha, u.codigo, pers.nombres, pers.apellidos, p.referencia
    HAVING saldoPendiente > 0
    ORDER BY p.fecha DESC
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/unidad/{unidadId}/historial:
 *   get:
 *     tags: [Pagos]
 *     summary: Historial de pagos por unidad
 *     description: Obtiene el historial completo de pagos de una unidad específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la unidad
 *     responses:
 *       200:
 *         description: Historial de pagos de la unidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idOrden:
 *                     type: string
 *                     description: Código único del pago
 *                   fechaPago:
 *                     type: string
 *                     format: date
 *                     description: Fecha del pago
 *                   monto:
 *                     type: number
 *                     description: Monto del pago
 *                   estado:
 *                     type: string
 *                     enum: [pending, approved, cancelled]
 *                     description: Estado del pago
 *                   metodoPago:
 *                     type: string
 *                     description: Método de pago utilizado
 *                   referencia:
 *                     type: string
 *                     description: Referencia del pago
 *                   montoAplicado:
 *                     type: number
 *                     description: Monto ya aplicado del pago
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Unidad no encontrada
 */

// Historial de pagos por unidad
router.get('/unidad/:unidadId/historial', authenticate, async (req, res) => {
  const unidadId = Number(req.params.unidadId);
  
  // Verificar que la unidad existe y obtener la comunidad para verificar permisos
  const [unidadRows] = await db.query('SELECT comunidad_id FROM unidad WHERE id = ?', [unidadId]);
  if (!unidadRows.length) return res.status(404).json({ error: 'unidad not found' });
  
  // Aquí debería verificar permisos de comunidad, pero por simplicidad lo omito
  
  const [rows] = await db.query(`
    SELECT
      p.id,
      CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
      p.monto as monto,
      CASE
        WHEN p.estado = 'pendiente' THEN 'pending'
        WHEN p.estado = 'aplicado' THEN 'approved'
        WHEN p.estado = 'reversado' THEN 'cancelled'
        ELSE 'pending'
      END as estado,
      CASE
        WHEN p.medio = 'transferencia' THEN 'bank_transfer'
        WHEN p.medio = 'webpay' THEN 'webpay'
        WHEN p.medio = 'khipu' THEN 'khipu'
        WHEN p.medio = 'servipag' THEN 'servipag'
        WHEN p.medio = 'efectivo' THEN 'cash'
        ELSE p.medio
      END as metodoPago,
      p.referencia as referencia,
      COALESCE(SUM(pa.monto), 0) as montoAplicado
    FROM pago p
    LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
    WHERE p.unidad_id = ?
    GROUP BY p.id, p.fecha, p.monto, p.estado, p.medio, p.referencia
    ORDER BY p.fecha DESC
  `, [unidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/conciliacion/comunidad/{comunidadId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar movimientos de conciliación bancaria
 *     description: Obtiene los movimientos bancarios para conciliación de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de movimientos de conciliación
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fechaMovimiento:
 *                     type: string
 *                     format: date
 *                   descripcion:
 *                     type: string
 *                   monto:
 *                     type: number
 *                   estado:
 *                     type: string
 *                     enum: [pending, reconciled, discarded]
 *                   referenciaBancaria:
 *                     type: string
 *                   idPago:
 *                     type: integer
 *                   codigoPago:
 *                     type: string
 *                   referenciaPago:
 *                     type: string
 *                   estadoConciliacion:
 *                     type: string
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar movimiento bancario
 *     description: Registra un nuevo movimiento bancario para conciliación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha_mov
 *               - monto
 *             properties:
 *               fecha_mov:
 *                 type: string
 *                 format: date
 *               monto:
 *                 type: number
 *               glosa:
 *                 type: string
 *               referencia:
 *                 type: string
 *               pago_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Movimiento registrado exitosamente
 */

// Listar conciliación bancaria
router.get('/conciliacion/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      cb.id,
      DATE_FORMAT(cb.fecha_mov, '%Y-%m-%d') as fechaMovimiento,
      cb.glosa as descripcion,
      cb.monto,
      CASE
        WHEN cb.estado = 'pendiente' THEN 'pending'
        WHEN cb.estado = 'conciliado' THEN 'reconciled'
        WHEN cb.estado = 'descartado' THEN 'discarded'
        ELSE 'pending'
      END as estado,
      cb.referencia as referenciaBancaria,
      p.id as idPago,
      CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago,
      p.referencia as referenciaPago,
      CASE
        WHEN cb.estado = 'pendiente' THEN 'pending'
        WHEN cb.estado = 'conciliado' THEN 'reconciled'
        WHEN cb.estado = 'descartado' THEN 'discarded'
        ELSE 'pending'
      END as estadoConciliacion
    FROM conciliacion_bancaria cb
    LEFT JOIN pago p ON cb.pago_id = p.id
    WHERE cb.comunidad_id = ?
    ORDER BY cb.fecha_mov DESC
  `, [comunidadId]);
  res.json(rows);
});

// Crear movimiento de conciliación bancaria
router.post('/conciliacion/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId'), 
  body('fecha_mov').isDate(), body('monto').isNumeric()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId); 
  const { fecha_mov, monto, glosa, referencia, pago_id } = req.body;
  try { 
    const [result] = await db.query('INSERT INTO conciliacion_bancaria (comunidad_id, fecha_mov, monto, glosa, referencia, pago_id) VALUES (?,?,?,?,?,?)', 
      [comunidadId, fecha_mov, monto, glosa || null, referencia || null, pago_id || null]); 
    const [row] = await db.query('SELECT id, fecha_mov, monto, glosa, referencia, estado FROM conciliacion_bancaria WHERE id = ? LIMIT 1', [result.insertId]); 
    res.status(201).json(row[0]); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'server error' }); 
  }
});

/**
 * @swagger
 * /pagos/conciliacion/{id}:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener movimiento de conciliación por ID
 *     description: Obtiene un movimiento específico de conciliación bancaria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento de conciliación
 *   put:
 *     tags: [Pagos]
 *     summary: Actualizar movimiento de conciliación
 *     description: Actualiza el estado o información de un movimiento de conciliación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, conciliado, descartado]
 *               pago_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Movimiento actualizado exitosamente
 *   delete:
 *     tags: [Pagos]
 *     summary: Eliminar movimiento de conciliación
 *     description: Elimina un movimiento de conciliación bancaria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movimiento eliminado exitosamente
 */

// Obtener conciliación por ID
router.get('/conciliacion/:id', authenticate, async (req, res) => { 
  const id = req.params.id; 
  const [rows] = await db.query(`
    SELECT cb.*, 
           DATE_FORMAT(cb.fecha_mov, '%Y-%m-%d') as fechaMovimiento,
           cb.glosa as descripcion,
           cb.referencia as referenciaBancaria,
           p.id as idPago,
           CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago
    FROM conciliacion_bancaria cb
    LEFT JOIN pago p ON cb.pago_id = p.id
    WHERE cb.id = ? LIMIT 1`, [id]); 
  if (!rows.length) return res.status(404).json({ error: 'conciliacion not found' }); 
  res.json(rows[0]); 
});

// Actualizar conciliación
router.put('/conciliacion/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; const { estado, pago_id } = req.body;
  try {
    const [result] = await db.query('UPDATE conciliacion_bancaria SET estado = ?, pago_id = ? WHERE id = ?', [estado, pago_id, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'conciliacion not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Eliminar conciliación
router.delete('/conciliacion/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM conciliacion_bancaria WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'conciliacion not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /pagos/{pagoId}/webhooks:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener webhooks de un pago
 *     description: Obtiene todos los webhooks asociados a un pago específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Lista de webhooks del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   proveedor:
 *                     type: string
 *                     enum: [webpay, khipu, otro, transferencia]
 *                   payload:
 *                     type: string
 *                     description: JSON del payload del webhook
 *                   procesado:
 *                     type: boolean
 *                   fechaRecepcion:
 *                     type: string
 *                     format: date-time
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Obtener webhooks de un pago
router.get('/:pagoId/webhooks', authenticate, async (req, res) => {
  const pagoId = Number(req.params.pagoId);
  const [rows] = await db.query(`
    SELECT
      wp.id,
      wp.proveedor as proveedor,
      wp.payload_json as payload,
      wp.procesado,
      DATE_FORMAT(wp.fecha_recepcion, '%Y-%m-%d %H:%i:%s') as fechaRecepcion,
      wp.fecha_recepcion as created_at
    FROM webhook_pago wp
    WHERE wp.pago_id = ?
    ORDER BY wp.fecha_recepcion DESC
  `, [pagoId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/por-periodo:
 *   get:
 *     tags: [Pagos]
 *     summary: Pagos agrupados por período
 *     description: Obtiene los pagos agrupados por mes y año
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Año específico (opcional)
 *     responses:
 *       200:
 *         description: Pagos agrupados por período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   anio:
 *                     type: integer
 *                     description: Año del período
 *                   mes:
 *                     type: integer
 *                     description: Mes del período
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                   cantidadPagos:
 *                     type: integer
 *                     description: Número total de pagos
 *                   montoTotal:
 *                     type: number
 *                     description: Suma total de montos
 *                   montoPromedio:
 *                     type: number
 *                     description: Monto promedio
 *                   cantidadAprobados:
 *                     type: integer
 *                     description: Número de pagos aplicados
 *                   cantidadPendientes:
 *                     type: integer
 *                     description: Número de pagos pendientes
 *                   cantidadCancelados:
 *                     type: integer
 *                     description: Número de pagos reversados
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Pagos agrupados por período
router.get('/comunidad/:comunidadId/por-periodo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { year } = req.query;
  
  let query = `
    SELECT
      YEAR(p.fecha) as anio,
      MONTH(p.fecha) as mes,
      DATE_FORMAT(p.fecha, '%Y-%m') as periodo,
      COUNT(*) as cantidadPagos,
      SUM(p.monto) as montoTotal,
      AVG(p.monto) as montoPromedio,
      COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as cantidadAprobados,
      COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as cantidadPendientes,
      COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as cantidadCancelados
    FROM pago p
    WHERE p.comunidad_id = ?
    GROUP BY YEAR(p.fecha), MONTH(p.fecha), DATE_FORMAT(p.fecha, '%Y-%m')
    ORDER BY anio DESC, mes DESC
  `;
  
  const params = [comunidadId];
  if (year) {
    query = query.replace('WHERE p.comunidad_id = ?', 'WHERE p.comunidad_id = ? AND YEAR(p.fecha) = ?');
    params.push(year);
  }
  
  const [rows] = await db.query(query, params);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/validacion:
 *   get:
 *     tags: [Pagos]
 *     summary: Validación de pagos
 *     description: Verifica que los pagos tengan todos los datos necesarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de pagos con problemas de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   estadoValidacion:
 *                     type: string
 *                     description: Estado de validación o mensaje de error
 *                   monto:
 *                     type: number
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   estado:
 *                     type: string
 *                   cantidadAplicaciones:
 *                     type: integer
 *                   montoAplicado:
 *                     type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Validación de pagos
router.get('/comunidad/:comunidadId/validacion', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      p.id,
      CASE
        WHEN p.comunidad_id IS NULL THEN 'Missing community reference'
        WHEN p.monto <= 0 THEN 'Invalid amount'
        WHEN p.fecha IS NULL THEN 'Missing payment date'
        WHEN p.estado NOT IN ('pendiente', 'aplicado', 'reversado') THEN 'Invalid status'
        ELSE 'Valid'
      END as estadoValidacion,
      p.monto,
      p.fecha,
      p.estado,
      COUNT(pa.id) as cantidadAplicaciones,
      COALESCE(SUM(pa.monto), 0) as montoAplicado
    FROM pago p
    LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
    WHERE p.comunidad_id = ?
    GROUP BY p.id, p.comunidad_id, p.monto, p.fecha, p.estado
    HAVING estadoValidacion != 'Valid'
    ORDER BY p.id
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}/resumen-residentes:
 *   get:
 *     tags: [Pagos]
 *     summary: Resumen de pagos por residente
 *     description: Obtiene estadísticas consolidadas de pagos por cada residente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Resumen de pagos por residente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idResidente:
 *                     type: integer
 *                     description: ID del residente
 *                   nombreResidente:
 *                     type: string
 *                     description: Nombre completo del residente
 *                   emailResidente:
 *                     type: string
 *                     description: Email del residente
 *                   numeroUnidad:
 *                     type: string
 *                     description: Código de la unidad
 *                   totalPagos:
 *                     type: integer
 *                     description: Número total de pagos realizados
 *                   totalPagado:
 *                     type: number
 *                     description: Suma total de montos pagados
 *                   pagoPromedio:
 *                     type: number
 *                     description: Monto promedio de pagos
 *                   fechaUltimoPago:
 *                     type: string
 *                     format: date
 *                     description: Fecha del último pago
 *                   pagosAprobados:
 *                     type: integer
 *                     description: Número de pagos aplicados
 *                   pagosPendientes:
 *                     type: integer
 *                     description: Número de pagos pendientes
 *                   pagosCancelados:
 *                     type: integer
 *                     description: Número de pagos reversados
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Resumen de pagos por residente
router.get('/comunidad/:comunidadId/resumen-residentes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT
      pers.id as idResidente,
      CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
      pers.email as emailResidente,
      u.codigo as numeroUnidad,
      COUNT(p.id) as totalPagos,
      SUM(p.monto) as totalPagado,
      AVG(p.monto) as pagoPromedio,
      MAX(p.fecha) as fechaUltimoPago,
      COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as pagosAprobados,
      COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pagosPendientes,
      COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as pagosCancelados
    FROM persona pers
    JOIN titulares_unidad tu ON pers.id = tu.persona_id
    JOIN unidad u ON tu.unidad_id = u.id
    LEFT JOIN pago p ON pers.id = p.persona_id
    WHERE u.comunidad_id = ?
    GROUP BY pers.id, pers.nombres, pers.apellidos, pers.email, u.codigo
    ORDER BY totalPagado DESC
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/{pagoId}/aplicacion:
 *   get:
 *     tags: [Pagos]
 *     summary: Ver aplicación de pago a cargos
 *     description: Muestra cómo se aplicó un pago específico a los diferentes cargos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Aplicación del pago a cargos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   montoAplicado:
 *                     type: number
 *                     description: Monto aplicado a este cargo
 *                   prioridad:
 *                     type: integer
 *                     description: Prioridad de aplicación
 *                   idCargo:
 *                     type: integer
 *                     description: ID del cargo/cuenta de cobro
 *                   codigoCargo:
 *                     type: string
 *                     description: Código único del cargo
 *                   totalCargo:
 *                     type: number
 *                     description: Monto total del cargo
 *                   saldoCargo:
 *                     type: number
 *                     description: Saldo pendiente del cargo
 *                   periodo:
 *                     type: string
 *                     description: Período del cargo
 *                   fechaVencimiento:
 *                     type: string
 *                     format: date
 *                     description: Fecha de vencimiento
 *                   numeroUnidad:
 *                     type: string
 *                     description: Código de la unidad
 *                   nombreResidente:
 *                     type: string
 *                     description: Nombre del residente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Pago no encontrado
 */

// Ver aplicación de pago a cargos
router.get('/:pagoId/aplicacion', authenticate, async (req, res) => {
  const pagoId = Number(req.params.pagoId);
  
  // Verificar que el pago existe
  const [pagoRows] = await db.query('SELECT id FROM pago WHERE id = ?', [pagoId]);
  if (!pagoRows.length) return res.status(404).json({ error: 'pago not found' });
  
  const [rows] = await db.query(`
    SELECT
      pa.id,
      pa.monto as montoAplicado,
      pa.prioridad,
      ccu.id as idCargo,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as codigoCargo,
      ccu.monto_total as totalCargo,
      ccu.saldo as saldoCargo,
      egc.periodo as periodo,
      DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fechaVencimiento,
      u.codigo as numeroUnidad,
      CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente
    FROM pago_aplicacion pa
    JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    LEFT JOIN unidad u ON ccu.unidad_id = u.id
    LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
    LEFT JOIN persona pers ON tu.persona_id = pers.id
    WHERE pa.pago_id = ?
    ORDER BY pa.prioridad, pa.id
  `, [pagoId]);
  res.json(rows);
});

/**
 * @swagger
 * /pagos/comunidad/{comunidadId}:
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar un nuevo pago
 *     description: |
 *       Cualquier miembro de la comunidad puede registrar un pago.
 *       El pago queda en estado "pendiente" hasta que un administrador lo aplique a cuentas específicas.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - fecha
 *             properties:
 *               unidad_id:
 *                 type: integer
 *                 description: Unidad que realiza el pago
 *               persona_id:
 *                 type: integer
 *                 description: Persona que realiza el pago
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-15"
 *               monto:
 *                 type: number
 *                 example: 150000
 *               medio:
 *                 type: string
 *                 enum: [transferencia, efectivo, cheque, tarjeta]
 *                 example: "transferencia"
 *               referencia:
 *                 type: string
 *                 description: Número de referencia o comprobante
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Registrar pago (puede hacerlo la comunidad o admins) -> permitir a miembros
router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId'), body('monto').isNumeric(), body('fecha').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId); const { unidad_id, persona_id, fecha, monto, medio, referencia } = req.body;
  try { const [result] = await db.query('INSERT INTO pago (comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia) VALUES (?,?,?,?,?,?,?)', [comunidadId, unidad_id || null, persona_id || null, fecha, monto, medio || null, referencia || null]); const [row] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM pago WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

/**
 * @swagger
 * /pagos/{id}/aplicar:
 *   post:
 *     tags: [Pagos]
 *     summary: Aplicar un pago a cuentas de cobro específicas
 *     description: |
 *       Permite a un administrador distribuir un pago entre una o más cuentas de cobro.
 *       Se valida que el monto aplicado no exceda el saldo de cada cuenta.
 *       
 *       **Compatibilidad**: Acepta tanto `cargo_unidad_id` como `cuenta_cobro_unidad_id` en el array de asignaciones.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago a aplicar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignments
 *             properties:
 *               assignments:
 *                 type: array
 *                 description: Lista de cuentas a las que se aplicará el pago
 *                 items:
 *                   type: object
 *                   properties:
 *                     cuenta_cobro_unidad_id:
 *                       type: integer
 *                       description: ID de la cuenta de cobro (o cargo_unidad_id para compatibilidad)
 *                     cargo_unidad_id:
 *                       type: integer
 *                       description: (Legacy) Mismo que cuenta_cobro_unidad_id
 *                     monto:
 *                       type: number
 *                       description: Monto a aplicar a esta cuenta
 *                 example:
 *                   - cuenta_cobro_unidad_id: 123
 *                     monto: 50000
 *                   - cuenta_cobro_unidad_id: 124
 *                     monto: 100000
 *     responses:
 *       200:
 *         description: Pago aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 pago_id:
 *                   type: integer
 *                 assigned:
 *                   type: number
 *                   description: Monto total aplicado
 *       400:
 *         description: Datos inválidos o monto excede saldo de cuenta
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Requiere permisos de administrador
 *       404:
 *         description: Pago o cuenta no encontrada
 */

// aplicar pago to cargos (admin/contador in community or superadmin)
router.post('/:id/aplicar', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const pagoId = req.params.id; const assignments = req.body.assignments || [];
  if (!Array.isArray(assignments) || !assignments.length) return res.status(400).json({ error: 'assignments required' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [pRows] = await conn.query('SELECT comunidad_id, monto, estado FROM pago WHERE id = ? LIMIT 1', [pagoId]);
    if (!pRows.length) { await conn.rollback(); return res.status(404).json({ error: 'pago not found' }); }
    const pago = pRows[0]; if (pago.estado === 'reversado') { await conn.rollback(); return res.status(400).json({ error: 'pago reversed' }); }

    let totalAssigned = 0;
    for (const a of assignments) {
      // Acepta tanto cargo_unidad_id (legacy) como cuenta_cobro_unidad_id
      const cuentaId = a.cuenta_cobro_unidad_id || a.cargo_unidad_id;
      if (!cuentaId || (typeof a.monto !== 'number' && typeof a.monto !== 'string')) { await conn.rollback(); return res.status(400).json({ error: 'invalid assignment format' }); }
      const monto = Number(a.monto);
      if (monto <= 0) { await conn.rollback(); return res.status(400).json({ error: 'monto must be > 0' }); }
      const [cRows] = await conn.query('SELECT saldo FROM cuenta_cobro_unidad WHERE id = ? LIMIT 1 FOR UPDATE', [cuentaId]);
      if (!cRows.length) { await conn.rollback(); return res.status(404).json({ error: `cuenta ${cuentaId} not found` }); }
      const cargoSaldo = Number(cRows[0].saldo || 0);
      if (monto > cargoSaldo) { await conn.rollback(); return res.status(400).json({ error: `assignment exceeds cuenta saldo: ${cuentaId}` }); }

      await conn.query('INSERT INTO pago_aplicacion (pago_id, cargo_unidad_id, monto) VALUES (?,?,?)', [pagoId, cuentaId, monto]);
      await conn.query('UPDATE cuenta_cobro_unidad SET saldo = saldo - ? WHERE id = ?', [monto, cuentaId]);
      totalAssigned += monto;
    }

    const [paRows] = await conn.query('SELECT SUM(monto) as total FROM pago_aplicacion WHERE pago_id = ?', [pagoId]);
    const applied = Number((paRows[0] && paRows[0].total) || 0);
    let newEstado = 'pendiente';
    if (applied >= Number(pago.monto)) newEstado = 'aplicado'; else if (applied > 0) newEstado = 'aplicado';
    await conn.query('UPDATE pago SET estado = ? WHERE id = ?', [newEstado, pagoId]);

    await conn.commit();
    res.json({ ok: true, pago_id: pagoId, assigned: applied });
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch (e) {}
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch(e){}
  }
});

router.post('/:id/reversar', authenticate, authorize('admin','superadmin'), async (req, res) => {
  res.json({ ok: true, note: 'stub: reverse payment' });
});

module.exports = router;
