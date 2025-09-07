const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Unidades
 *     description: Gestión de unidades
 */

/**
 * @openapi
 * /unidades/comunidad/{comunidadId}:
 *   get:
 *     tags: [Unidades]
 *     summary: Listar unidades de comunidad
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
 *         description: Lista de unidades
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const [rows] = await db.query('SELECT id, codigo, edificio_id, torre_id, alicuota, activa FROM unidad WHERE comunidad_id = ? LIMIT 500', [comunidadId]);
  res.json(rows);
});

/**
 * @openapi
 * /unidades/comunidad/{comunidadId}:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear unidad en comunidad
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
 *               codigo:
 *                 type: string
 *               alicuota:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('codigo').notEmpty()], async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const { edificio_id, torre_id, codigo, alicuota, m2_utiles, m2_terrazas, nro_bodega, nro_estacionamiento, activa } = req.body;
  // enforce XOR: one of edificio_id or torre_id must be provided, not both
  if ((edificio_id && torre_id) || (!edificio_id && !torre_id)) {
    return res.status(400).json({ error: 'provide exactly one of edificio_id or torre_id' });
  }
  try {
    const [result] = await db.query('INSERT INTO unidad (comunidad_id, edificio_id, torre_id, codigo, alicuota, m2_utiles, m2_terrazas, nro_bodega, nro_estacionamiento, activa) VALUES (?,?,?,?,?,?,?,?,?,?)', [comunidadId, edificio_id || null, torre_id || null, codigo, alicuota || 0, m2_utiles || null, m2_terrazas || null, nro_bodega || null, nro_estacionamiento || null, typeof activa === 'undefined' ? 1 : (activa ? 1 : 0)]);
    const [row] = await db.query('SELECT id, codigo, edificio_id, torre_id, alicuota FROM unidad WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'codigo must be unique per comunidad' });
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /unidades/{id}:
 *   get:
 *     tags: [Unidades]
 *     summary: Obtener unidad por id
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
 *         description: Unidad
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT * FROM unidad WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

/**
 * @openapi
 * /unidades/{id}:
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar unidad
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
  const fields = ['edificio_id','torre_id','codigo','alicuota','m2_utiles','m2_terrazas','nro_bodega','nro_estacionamiento','activa'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try {
    // if both edificio_id and torre_id provided, reject
    if (req.body.edificio_id !== undefined && req.body.torre_id !== undefined) {
      return res.status(400).json({ error: 'provide at most one of edificio_id or torre_id' });
    }
    await db.query(`UPDATE unidad SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT * FROM unidad WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'codigo must be unique per comunidad' });
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /unidades/{id}:
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar unidad
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
router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM unidad WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /unidades/{id}/tenencias:
 *   get:
 *     tags: [Unidades]
 *     summary: Listar tenencias de una unidad
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
 *         description: Lista de tenencias
 */
// GET tenencias for a unidad
router.get('/:id/tenencias', authenticate, async (req, res) => {
  const unidadId = req.params.id;
  const { activo } = req.query; // if activo=1, return current tenencias
  try {
    let sql = 'SELECT t.id, t.persona_id, t.tipo, t.desde, t.hasta, t.porcentaje, p.nombres, p.apellidos, p.email FROM tenencia_unidad t LEFT JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? ORDER BY t.desde DESC';
    const params = [unidadId];
    const [rows] = await db.query(sql, params);
    const today = new Date().toISOString().slice(0,10);
    if (activo === '1') {
      return res.json(rows.filter(r => (!r.hasta || r.hasta >= today)));
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /unidades/{id}/tenencias:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear tenencia para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               persona_id:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               desde:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
// POST crear tenencia para una unidad
router.post('/:id/tenencias', [authenticate, authorize('admin','superadmin'), body('persona_id').isInt(), body('tipo').notEmpty(), body('desde').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const unidadId = req.params.id; const { persona_id, tipo, desde, hasta, porcentaje } = req.body;
  try {
    // get comunidad_id from unidad
    const [urows] = await db.query('SELECT comunidad_id FROM unidad WHERE id = ? LIMIT 1', [unidadId]);
    if (!urows.length) return res.status(404).json({ error: 'unidad not found' });
    const comunidad_id = urows[0].comunidad_id;
    const [result] = await db.query('INSERT INTO tenencia_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, hasta, porcentaje) VALUES (?,?,?,?,?,?,?)', [comunidad_id, unidadId, persona_id, tipo, desde, hasta || null, porcentaje || 100.00]);
    const [row] = await db.query('SELECT id, persona_id, tipo, desde, hasta, porcentaje FROM tenencia_unidad WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /unidades/{id}/residentes:
 *   get:
 *     tags: [Unidades]
 *     summary: Obtener residentes activos de una unidad
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
 *         description: Lista de residentes
 */
// GET residentes activos (propietario/arrendatario) para unidad
router.get('/:id/residentes', authenticate, async (req, res) => {
  const unidadId = req.params.id;
  try {
    const today = new Date().toISOString().slice(0,10);
    const [rows] = await db.query("SELECT p.id, p.rut, p.dv, p.nombres, p.apellidos, t.tipo, t.desde, t.hasta, t.porcentaje FROM tenencia_unidad t JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? AND t.tipo IN ('propietario','arrendatario') AND (t.hasta IS NULL OR t.hasta >= ?) ORDER BY t.desde DESC", [unidadId, today]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
