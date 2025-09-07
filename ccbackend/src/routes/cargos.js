const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Cargos
 *     description: Cargos por unidad y operaciones relacionadas
 */
/**
 * @openapi
 * /cargos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Cargos]
 *     summary: Listar cargos con filtros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: unidad
 *         schema:
 *           type: integer
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de cargos
 */

// list cargos by comunidad with filters
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId; const { estado, unidad, periodo, page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  // basic filters
  const conditions = ['comunidad_id = ?']; const params = [comunidadId];
  if (estado) { conditions.push('estado = ?'); params.push(estado); }
  if (unidad) { conditions.push('unidad_id = ?'); params.push(unidad); }
  if (periodo) { conditions.push("DATE_FORMAT(created_at, '%Y-%m') = ?"); params.push(periodo); }
  const sql = `SELECT id, unidad_id, monto_total, saldo, estado FROM cargo_unidad WHERE ${conditions.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM cargo_unidad WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.get('/unidad/:id', authenticate, async (req, res) => { const unidadId = req.params.id; const [rows] = await db.query('SELECT id, monto_total, saldo, estado FROM cargo_unidad WHERE unidad_id = ? ORDER BY created_at DESC LIMIT 500', [unidadId]); res.json(rows); });

router.post('/:id/recalcular-interes', authenticate, authorize('admin','superadmin'), async (req, res) => { // stub
  // In production recalculate intereses based on configuration
  res.json({ ok: true, note: 'stub: recalculate interest' });
});

router.post('/:id/notificar', authenticate, authorize('admin','superadmin'), async (req, res) => { // stub
  // Notify responsible person(s) about charge
  res.json({ ok: true, note: 'stub: notify about charge' });
});

module.exports = router;
