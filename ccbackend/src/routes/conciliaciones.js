// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * /comunidades/{comunidadId}/conciliaciones:
 *   get:
 *     tags: [Conciliaciones]
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE comunidad_id = ? ORDER BY fecha_mov DESC LIMIT 200', [comunidadId]);
  res.json(rows);
});

router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin','contador']), body('fecha_mov').notEmpty(), body('monto').isNumeric()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { fecha_mov, monto, glosa, referencia, pago_id } = req.body;
  try { const [result] = await db.query('INSERT INTO conciliacion_bancaria (comunidad_id, fecha_mov, monto, glosa, referencia, pago_id) VALUES (?,?,?,?,?,?)', [comunidadId, fecha_mov, monto, glosa || null, referencia || null, pago_id || null]); const [row] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.estado) return res.status(400).json({ error: 'estado required' }); try { await db.query('UPDATE conciliacion_bancaria SET estado = ? WHERE id = ?', [req.body.estado, id]); const [rows] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;