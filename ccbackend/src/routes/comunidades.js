const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Comunidades
 *     description: Gestión de comunidades
 */

/**
 * @openapi
 * /comunidades:
 *   get:
 *     tags: [Comunidades]
 *     summary: Lista comunidades (limit 200)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comunidades
 */
router.get('/', authenticate, async (req, res) => {
  const [rows] = await db.query('SELECT id, razon_social, rut, dv, direccion, email_contacto FROM comunidad LIMIT 200');
  res.json(rows);
});

/**
 * @openapi
 * /comunidades:
 *   post:
 *     tags: [Comunidades]
 *     summary: Crear comunidad
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razon_social, rut, dv]
 *             properties:
 *               razon_social:
 *                 type: string
 *               rut:
 *                 type: string
 *               dv:
 *                 type: string
 *               giro:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', [authenticate, authorize('admin','superadmin'), body('razon_social').notEmpty(), body('rut').notEmpty(), body('dv').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto } = req.body;
  try {
    const [result] = await db.query('INSERT INTO comunidad (razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto) VALUES (?,?,?,?,?,?,?)', [razon_social, rut, dv, giro || null, direccion || null, email_contacto || null, telefono_contacto || null]);
    const [row] = await db.query('SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener comunidad por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Comunidad
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT id, razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto FROM comunidad WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

/**
 * @openapi
 * /comunidades/{id}:
 *   patch:
 *     tags: [Comunidades]
 *     summary: Actualizar comunidad parcialmente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  const fields = ['razon_social','rut','dv','giro','direccion','email_contacto','telefono_contacto','moneda','tz'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try {
    await db.query(`UPDATE comunidad SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   delete:
 *     tags: [Comunidades]
 *     summary: Eliminar comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/:id', authenticate, authorize('superadmin'), async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM comunidad WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
