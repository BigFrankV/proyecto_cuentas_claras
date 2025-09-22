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
 *     description: Pagos, aplicaciones y reversos
 */

// Listar pagos por comunidad
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE comunidad_id = ? ORDER BY fecha DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

// Registrar pago (puede hacerlo la comunidad o admins) -> permitir a miembros
router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId'), body('monto').isNumeric(), body('fecha').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId); const { unidad_id, persona_id, fecha, monto, medio, referencia } = req.body;
  try { const [result] = await db.query('INSERT INTO pago (comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia) VALUES (?,?,?,?,?,?,?)', [comunidadId, unidad_id || null, persona_id || null, fecha, monto, medio || null, referencia || null]); const [row] = await db.query('SELECT id, fecha, monto, medio, estado FROM pago WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM pago WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

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
      if (!a.cargo_unidad_id || (typeof a.monto !== 'number' && typeof a.monto !== 'string')) { await conn.rollback(); return res.status(400).json({ error: 'invalid assignment format' }); }
      const monto = Number(a.monto);
      if (monto <= 0) { await conn.rollback(); return res.status(400).json({ error: 'monto must be > 0' }); }
      const [cRows] = await conn.query('SELECT saldo FROM cargo_unidad WHERE id = ? LIMIT 1 FOR UPDATE', [a.cargo_unidad_id]);
      if (!cRows.length) { await conn.rollback(); return res.status(404).json({ error: `cargo ${a.cargo_unidad_id} not found` }); }
      const cargoSaldo = Number(cRows[0].saldo || 0);
      if (monto > cargoSaldo) { await conn.rollback(); return res.status(400).json({ error: `assignment exceeds cargo saldo: ${a.cargo_unidad_id}` }); }

      await conn.query('INSERT INTO pago_aplicacion (pago_id, cargo_unidad_id, monto) VALUES (?,?,?)', [pagoId, a.cargo_unidad_id, monto]);
      await conn.query('UPDATE cargo_unidad SET saldo = saldo - ? WHERE id = ?', [monto, a.cargo_unidad_id]);
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
