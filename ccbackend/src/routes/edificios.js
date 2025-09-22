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
 * tags:
 *   - name: Edificios
 *     description: Gestión de edificios
 */

// List edificios por comunidad
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, nombre, direccion, codigo FROM edificio WHERE comunidad_id = ? LIMIT 200', [comunidadId]);
  res.json(rows);
});

// Crear edificio (admin)
router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin']), body('nombre').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { nombre, direccion, codigo } = req.body;
  try { const [result] = await db.query('INSERT INTO edificio (comunidad_id, nombre, direccion, codigo) VALUES (?,?,?,?)', [comunidadId, nombre, direccion || null, codigo || null]); const [row] = await db.query('SELECT id, nombre, direccion, codigo FROM edificio WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT id, comunidad_id, nombre, direccion, codigo FROM edificio WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['nombre','direccion','codigo']; const updates = []; const values = []; fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE edificio SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, comunidad_id, nombre, direccion, codigo FROM edificio WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM torre WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;