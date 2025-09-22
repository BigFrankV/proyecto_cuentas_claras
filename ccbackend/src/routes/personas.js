const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize, allowSelfOrRoles } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Personas
 *     description: Gestión de personas
 */

/**
 * @openapi
 * /personas:
 *   get:
 *     tags: [Personas]
 *     summary: Listar personas o buscar por rut
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rut
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista o persona
 */
router.get('/', authenticate, async (req, res) => {
  const { rut } = req.query;
  
  try {
    // ✅ Superadmin ve TODAS las personas
    if (req.user.is_superadmin) {
      if (rut) {
        const [rows] = await db.query('SELECT * FROM persona WHERE rut = ? LIMIT 1', [rut]);
        return res.json(rows[0] || null);
      }
      const [rows] = await db.query('SELECT id, rut, dv, nombres, apellidos, email, telefono FROM persona LIMIT 500');
      return res.json(rows);
    }

    // ✅ Usuarios normales solo ven personas de SUS comunidades
    const personaId = req.user.persona_id;
    if (!personaId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    if (rut) {
      const [rows] = await db.query(`
        SELECT DISTINCT p.* 
        FROM persona p
        JOIN membresia_comunidad mc ON p.id = mc.persona_id
        WHERE p.rut = ? AND mc.comunidad_id IN (
          SELECT comunidad_id FROM membresia_comunidad 
          WHERE persona_id = ? AND activo = 1
        )
        LIMIT 1
      `, [rut, personaId]);
      return res.json(rows[0] || null);
    }

    const [rows] = await db.query(`
      SELECT DISTINCT p.id, p.rut, p.dv, p.nombres, p.apellidos, p.email, p.telefono 
      FROM persona p
      JOIN membresia_comunidad mc ON p.id = mc.persona_id
      WHERE mc.comunidad_id IN (
        SELECT comunidad_id FROM membresia_comunidad 
        WHERE persona_id = ? AND activo = 1
      )
      ORDER BY p.apellidos, p.nombres
      LIMIT 500
    `, [personaId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas:
 *   post:
 *     tags: [Personas]
 *     summary: Crear persona
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rut,dv,nombres,apellidos]
 *             properties:
 *               rut:
 *                 type: string
 *               dv:
 *                 type: string
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', [authenticate, authorize('admin','superadmin'), body('rut').notEmpty(), body('dv').notEmpty(), body('nombres').notEmpty(), body('apellidos').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { rut,dv,nombres,apellidos,email,telefono,direccion } = req.body;
  try {
    const [result] = await db.query('INSERT INTO persona (rut,dv,nombres,apellidos,email,telefono,direccion) VALUES (?,?,?,?,?,?,?)', [rut,dv,nombres,apellidos,email||null,telefono||null,direccion||null]);
    const [row] = await db.query('SELECT id, rut, dv, nombres, apellidos FROM persona WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener persona por id
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
 *         description: Persona
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT * FROM persona WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

/**
 * @openapi
 * /personas/{id}:
 *   patch:
 *     tags: [Personas]
 *     summary: Actualizar persona
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
router.patch('/:id', authenticate, allowSelfOrRoles('id', 'admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  const fields = ['rut','dv','nombres','apellidos','email','telefono','direccion'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try {
    await db.query(`UPDATE persona SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT id, rut, dv, nombres, apellidos FROM persona WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}:
 *   delete:
 *     tags: [Personas]
 *     summary: Eliminar persona
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
router.delete('/:id', authenticate, allowSelfOrRoles('id', 'admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  try {
    // only admins or self (allowSelfOrRoles applied) reach here
    await db.query('DELETE FROM persona WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
