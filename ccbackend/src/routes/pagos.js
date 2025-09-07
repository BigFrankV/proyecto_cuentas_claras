const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Pagos
 *     description: Pagos, aplicaciones y reversos
 */

/**
 * @openapi
 * /pagos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar pagos por comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pagos
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId; const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE comunidad_id = ? ORDER BY fecha DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

/**
 * @openapi
 * /comunidades/{comunidadId}/pagos:
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar un pago en la comunidad
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
 *             properties:
 *               unidad_id:
 *                 type: integer
 *               persona_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *               monto:
 *                 type: number
 *               medio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, body('monto').isNumeric(), body('fecha').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = req.params.comunidadId; const { unidad_id, persona_id, fecha, monto, medio, referencia } = req.body;
  try { const [result] = await db.query('INSERT INTO pago (comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia) VALUES (?,?,?,?,?,?,?)', [comunidadId, unidad_id || null, persona_id || null, fecha, monto, medio || null, referencia || null]); const [row] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM pago WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

// aplicar pago to cargos (payload: [{cargo_unidad_id, monto}, ...])
router.post('/:id/aplicar', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const pagoId = req.params.id; const assignments = req.body.assignments || [];
  if (!Array.isArray(assignments) || !assignments.length) return res.status(400).json({ error: 'assignments required' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // load pago
    const [pRows] = await conn.query('SELECT comunidad_id, monto, estado FROM pago WHERE id = ? LIMIT 1', [pagoId]);
    if (!pRows.length) { await conn.rollback(); return res.status(404).json({ error: 'pago not found' }); }
    const pago = pRows[0]; if (pago.estado === 'reversado') { await conn.rollback(); return res.status(400).json({ error: 'pago reversed' }); }

    let totalAssigned = 0;
    for (const a of assignments) {
      if (!a.cargo_unidad_id || typeof a.monto !== 'number' && typeof a.monto !== 'string') { await conn.rollback(); return res.status(400).json({ error: 'invalid assignment format' }); }
      const monto = Number(a.monto);
      if (monto <= 0) { await conn.rollback(); return res.status(400).json({ error: 'monto must be > 0' }); }
      // check cargo exists and saldo
      const [cRows] = await conn.query('SELECT saldo FROM cargo_unidad WHERE id = ? LIMIT 1 FOR UPDATE', [a.cargo_unidad_id]);
      if (!cRows.length) { await conn.rollback(); return res.status(404).json({ error: `cargo ${a.cargo_unidad_id} not found` }); }
      const cargoSaldo = Number(cRows[0].saldo || 0);
      if (monto > cargoSaldo) { await conn.rollback(); return res.status(400).json({ error: `assignment exceeds cargo saldo: ${a.cargo_unidad_id}` }); }

      // insert pago_aplicacion
      await conn.query('INSERT INTO pago_aplicacion (pago_id, cargo_unidad_id, monto) VALUES (?,?,?)', [pagoId, a.cargo_unidad_id, monto]);
      // update cargo saldo
      await conn.query('UPDATE cargo_unidad SET saldo = saldo - ? WHERE id = ?', [monto, a.cargo_unidad_id]);
      totalAssigned += monto;
    }

    // update pago estado depending on assigned amount
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
  // In production mark pago as reversed and undo pago_aplicacion effects
  res.json({ ok: true, note: 'stub: reverse payment' });
});

module.exports = router;
