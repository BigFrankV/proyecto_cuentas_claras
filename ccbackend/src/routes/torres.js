const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * /edificios/{edificioId}/torres:
 *   get:
 *     tags: [Torres]
 *     summary: Listar torres de un edificio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de torres
 */
// List torres for edificio
router.get('/edificio/:edificioId', authenticate, async (req, res) => {
  const edificioId = req.params.edificioId;
  const [rows] = await db.query('SELECT id, nombre FROM torre WHERE edificio_id = ? LIMIT 200', [edificioId]);
  res.json(rows);
});

/**
 * @openapi
 * /edificios/{edificioId}/torres:
 *   post:
 *     tags: [Torres]
 *     summary: Crear torre en un edificio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
// Create torre
router.post('/edificio/:edificioId', [authenticate, authorize('admin','superadmin'), body('nombre').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const edificioId = req.params.edificioId;
  try {
    const [result] = await db.query('INSERT INTO torre (edificio_id, nombre) VALUES (?,?)', [edificioId, req.body.nombre]);
    const [row] = await db.query('SELECT id, nombre FROM torre WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

// Get, patch, delete torre
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id; const [rows] = await db.query('SELECT * FROM torre WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]);
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; const fields = ['nombre'];
  const updates = []; const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id);
  try { await db.query(`UPDATE torre SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT * FROM torre WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => {
  const id = req.params.id; try { await db.query('DELETE FROM torre WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;
