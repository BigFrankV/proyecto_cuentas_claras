const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Gastos
 *     description: Gastos y su registro
 */

/**
 * @openapi
 * /gastos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Listar gastos por comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Lista de gastos
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId; const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, categoria_id, fecha, monto, glosa FROM gasto WHERE comunidad_id = ? ORDER BY fecha DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

/**
 * @openapi
 * /comunidades/{comunidadId}/gastos:
 *   post:
 *     tags: [Gastos]
 *     summary: Crear gasto en una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *               monto:
 *                 type: number
 *               glosa:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('categoria_id').isInt(), body('fecha').notEmpty(), body('monto').isNumeric()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = req.params.comunidadId; const { categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario } = req.body;
  try { const [result] = await db.query('INSERT INTO gasto (comunidad_id, categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario) VALUES (?,?,?,?,?,?,?,?)', [comunidadId, categoria_id, centro_costo_id || null, documento_compra_id || null, fecha, monto, glosa || null, extraordinario ? 1 : 0]); const [row] = await db.query('SELECT id, categoria_id, fecha, monto FROM gasto WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM gasto WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['categoria_id','centro_costo_id','documento_compra_id','fecha','monto','glosa','extraordinario']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE gasto SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, categoria_id, fecha, monto FROM gasto WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM gasto WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;
