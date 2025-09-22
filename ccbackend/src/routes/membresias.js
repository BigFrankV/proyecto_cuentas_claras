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
 * /comunidades/{comunidadId}/membresias:
 *   get:
 *     tags: [Membresias]
 *     summary: Listar membresías de una comunidad
 */

// List membresias for comunidad (members only)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, persona_id, rol, activo FROM membresia_comunidad WHERE comunidad_id = ? LIMIT 500', [comunidadId]);
  res.json(rows);
});

// Create membresia (admin of comunidad or superadmin)
router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin']), body('persona_id').isInt(), body('rol').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId);
  const { persona_id, rol, activo, desde, hasta } = req.body;
  const allowedRoles = ['admin','comite','conserje','contador','residente','propietario'];
  if (!allowedRoles.includes(String(rol).toLowerCase())) return res.status(400).json({ error: 'invalid rol' });
  const desdeVal = desde || new Date().toISOString().slice(0,10); // YYYY-MM-DD
  try {
    const [result] = await db.query('INSERT INTO membresia_comunidad (comunidad_id, persona_id, rol, desde, hasta, activo) VALUES (?,?,?,?,?,?)', [comunidadId, persona_id, rol, desdeVal, hasta || null, typeof activo === 'undefined' ? 1 : (activo ? 1 : 0)]);
    const [row] = await db.query('SELECT id, persona_id, rol, desde, hasta, activo FROM membresia_comunidad WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

// Patch and delete remain admin/superadmin (based on membership or global role)
router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; const fields = ['rol','activo']; const updates = []; const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id);
  try { await db.query(`UPDATE membresia_comunidad SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, persona_id, rol, activo FROM membresia_comunidad WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM membresia_comunidad WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;