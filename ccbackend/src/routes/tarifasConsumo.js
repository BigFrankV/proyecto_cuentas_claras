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
 * /comunidades/{comunidadId}/tarifas-consumo:
 *   get:
 *     tags: [Tarifas]
 *     summary: Listar tarifas de consumo de una comunidad
 */
// listar tarifas por comunidad (miembros)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, tipo, periodo_desde, precio_por_unidad, cargo_fijo FROM tarifa_consumo WHERE comunidad_id = ? ORDER BY periodo_desde DESC LIMIT 200', [comunidadId]);
  res.json(rows);
});

router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin','contador']), body('tipo').notEmpty(), body('periodo_desde').notEmpty(), body('precio_por_unidad').isNumeric()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { tipo, periodo_desde, periodo_hasta, precio_por_unidad, cargo_fijo } = req.body;
  try { const [result] = await db.query('INSERT INTO tarifa_consumo (comunidad_id, tipo, periodo_desde, periodo_hasta, precio_por_unidad, cargo_fijo) VALUES (?,?,?,?,?,?)', [comunidadId, tipo, periodo_desde, periodo_hasta || null, precio_por_unidad, cargo_fijo || 0]); const [row] = await db.query('SELECT id, tipo, periodo_desde, precio_por_unidad FROM tarifa_consumo WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM tarifa_consumo WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['tipo','periodo_desde','periodo_hasta','precio_por_unidad','cargo_fijo']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE tarifa_consumo SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, tipo, periodo_desde, precio_por_unidad FROM tarifa_consumo WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM tarifa_consumo WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;