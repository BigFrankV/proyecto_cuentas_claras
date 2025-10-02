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
 * /edificios/{edificioId}/torres:
 *   get:
 *     tags: [Torres]
 */

// Get torres by comunidad
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT t.id, t.nombre, t.edificio_id, e.nombre as edificio_nombre
      FROM torre t
      INNER JOIN edificio e ON e.id = t.edificio_id
      WHERE e.comunidad_id = ?
      ORDER BY e.nombre, t.nombre
      LIMIT 200
    `, [comunidadId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching torres:', error);
    res.status(500).json({ error: 'Error fetching torres' });
  }
});

// List torres for edificio (edificio belongs to comunidad, but request has edificioId)
router.get('/edificio/:edificioId', authenticate, async (req, res) => {
  const edificioId = Number(req.params.edificioId);
  const [rows] = await db.query('SELECT id, nombre FROM torre WHERE edificio_id = ? LIMIT 200', [edificioId]);
  res.json(rows);
});

// Create torre in edificio: ensure user belongs to the comunidad for that edificio
router.post('/edificio/:edificioId', [authenticate, async (req,res,next)=>{ // small inline check to map edificio->comunidad then requireCommunity
  const edificioId = Number(req.params.edificioId);
  try {
    const [erows] = await db.query('SELECT comunidad_id FROM edificio WHERE id = ? LIMIT 1', [edificioId]);
    if (!erows.length) return res.status(404).json({ error: 'edificio not found' });
    req.params.comunidadId = erows[0].comunidad_id;
    next();
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
}, requireCommunity('comunidadId', ['admin']), body('nombre').notEmpty()], async (req, res) => {
  const edificioId = Number(req.params.edificioId);
  try {
    const [result] = await db.query('INSERT INTO torre (edificio_id, nombre) VALUES (?,?)', [edificioId, req.body.nombre]);
    const [row] = await db.query('SELECT id, nombre FROM torre WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM torre WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['nombre']; const updates = []; const values = []; fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE torre SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT * FROM torre WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM torre WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;