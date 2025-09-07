const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Edificios
 *     description: Gestión de edificios
 */

/**
 * @openapi
 * /edificios/comunidad/{comunidadId}:
 *   get:
 *     tags: [Edificios]
 *     summary: Listar edificios de una comunidad
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
 *         description: Lista de edificios
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const [rows] = await db.query('SELECT id, nombre, direccion, codigo FROM edificio WHERE comunidad_id = ? LIMIT 200', [comunidadId]);
  res.json(rows);
});

/**
 * @openapi
 * /edificios/comunidad/{comunidadId}:
 *   post:
 *     tags: [Edificios]
 *     summary: Crear edificio en comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('nombre').notEmpty()], async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const { nombre, direccion, codigo } = req.body;
  try {
    const [result] = await db.query('INSERT INTO edificio (comunidad_id, nombre, direccion, codigo) VALUES (?,?,?,?)', [comunidadId, nombre, direccion || null, codigo || null]);
    const [row] = await db.query('SELECT id, nombre, direccion, codigo FROM edificio WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /edificios/{id}:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener edificio por id
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
 *         description: Edificio
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT id, comunidad_id, nombre, direccion, codigo FROM edificio WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

/**
 * @openapi
 * /edificios/{id}:
 *   patch:
 *     tags: [Edificios]
 *     summary: Actualizar edificio
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
  const fields = ['nombre','direccion','codigo'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try {
    await db.query(`UPDATE edificio SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT id, comunidad_id, nombre, direccion, codigo FROM edificio WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /edificios/{id}:
 *   delete:
 *     tags: [Edificios]
 *     summary: Eliminar edificio
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
router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM edificio WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
