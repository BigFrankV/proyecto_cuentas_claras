const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * /comunidades/{comunidadId}/centros-costo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listar centros de costo por comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de centros de costo
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const [rows] = await db.query('SELECT id, nombre FROM centro_costo WHERE comunidad_id = ? LIMIT 500', [comunidadId]);
  res.json(rows);
});

/**
 * @openapi
 * /comunidades/{comunidadId}/centros-costo:
 *   post:
 *     tags: [CentrosCosto]
 *     summary: Crear centro de costo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
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
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('nombre').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = req.params.comunidadId; const { nombre } = req.body;
  try { const [result] = await db.query('INSERT INTO centro_costo (comunidad_id, nombre) VALUES (?,?)', [comunidadId, nombre]); const [row] = await db.query('SELECT id, nombre FROM centro_costo WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.nombre) return res.status(400).json({ error: 'nombre required' }); try { await db.query('UPDATE centro_costo SET nombre = ? WHERE id = ?', [req.body.nombre, id]); const [rows] = await db.query('SELECT id, nombre FROM centro_costo WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });
router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM centro_costo WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;
