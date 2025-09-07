const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Proveedores
 *     description: Gestión de proveedores por comunidad
 */

/**
 * @openapi
 * /comunidades/{comunidadId}/proveedores:
 *   get:
 *     tags: [Proveedores]
 *     summary: Listar proveedores de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de proveedores
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const { page = 1, limit = 100, sort } = req.query;
  const offset = (page-1)*limit;
  const [rows] = await db.query('SELECT id, rut, dv, razon_social, email FROM proveedor WHERE comunidad_id = ? ORDER BY id DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('rut').notEmpty(), body('dv').notEmpty(), body('razon_social').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = req.params.comunidadId; const { rut,dv,razon_social,giro,email,telefono,direccion } = req.body;
  try { const [result] = await db.query('INSERT INTO proveedor (comunidad_id, rut, dv, razon_social, giro, email, telefono, direccion) VALUES (?,?,?,?,?,?,?,?)', [comunidadId, rut, dv, razon_social, giro||null, email||null, telefono||null, direccion||null]); const [row] = await db.query('SELECT id, rut, dv, razon_social FROM proveedor WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'proveedor exists' }); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM proveedor WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['rut','dv','razon_social','giro','email','telefono','direccion']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE proveedor SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, rut, dv, razon_social FROM proveedor WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM proveedor WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;
