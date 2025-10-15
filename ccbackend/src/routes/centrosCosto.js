// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * /comunidades/{comunidadId}/centros-costo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listar centros de costo por comunidad
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, nombre FROM centro_costo WHERE comunidad_id = ? LIMIT 500', [comunidadId]);
  res.json(rows);
});

router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin']), body('nombre').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { nombre } = req.body;
  try { const [result] = await db.query('INSERT INTO centro_costo (comunidad_id, nombre) VALUES (?,?)', [comunidadId, nombre]); const [row] = await db.query('SELECT id, nombre FROM centro_costo WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.nombre) return res.status(400).json({ error: 'nombre required' }); try { await db.query('UPDATE centro_costo SET nombre = ? WHERE id = ?', [req.body.nombre, id]); const [rows] = await db.query('SELECT id, nombre FROM centro_costo WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });
router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM centro_costo WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;