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
