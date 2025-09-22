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
 * /comunidades/{comunidadId}/categorias-gasto:
 *   get:
 *     tags: [CategoriasGasto]
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, nombre FROM categoria_gasto WHERE comunidad_id = ? LIMIT 500', [comunidadId]);
  res.json(rows);
});

router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin']), body('nombre').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId); const { nombre, tipo, cta_contable, activa } = req.body;
  const allowedTipos = ['operacional','extraordinario','fondo_reserva','multas','consumo'];
  const tipoVal = allowedTipos.includes(tipo) ? tipo : 'operacional';
  try {
    const [result] = await db.query('INSERT INTO categoria_gasto (comunidad_id, nombre, tipo, cta_contable, activa) VALUES (?,?,?,?,?)', [comunidadId, nombre, tipoVal, cta_contable || null, typeof activa === 'undefined' ? 1 : (activa ? 1 : 0)]);
    const [row] = await db.query('SELECT id, nombre, tipo, cta_contable, activa FROM categoria_gasto WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'nombre exists' });
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT id, nombre FROM categoria_gasto WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });
router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.nombre) return res.status(400).json({ error: 'nombre required' }); try { await db.query('UPDATE categoria_gasto SET nombre = ? WHERE id = ?', [req.body.nombre, id]); const [rows] = await db.query('SELECT id, nombre FROM categoria_gasto WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });
router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM categoria_gasto WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;