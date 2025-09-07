const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * /comunidades/{comunidadId}/amenidades:
 *   get:
 *     tags: [Amenidades]
 *     summary: Listar amenidades de una comunidad
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
 *         description: Lista de amenidades
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => { const comunidadId = req.params.comunidadId; const [rows] = await db.query('SELECT id, nombre, reglas, capacidad, tarifa FROM amenidad WHERE comunidad_id = ? LIMIT 200', [comunidadId]); res.json(rows); });

/**
 * @openapi
 * /comunidades/{comunidadId}/amenidades:
 *   post:
 *     tags: [Amenidades]
 *     summary: Crear una amenidad
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
 *               reglas:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               tarifa:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('nombre').notEmpty()], async (req, res) => { const comunidadId = req.params.comunidadId; const { nombre, reglas, capacidad, requiere_aprobacion, tarifa } = req.body; try { const [result] = await db.query('INSERT INTO amenidad (comunidad_id, nombre, reglas, capacidad, requiere_aprobacion, tarifa) VALUES (?,?,?,?,?,?)', [comunidadId, nombre, reglas || null, capacidad || null, requiere_aprobacion ? 1 : 0, tarifa || null]); const [row] = await db.query('SELECT id, nombre FROM amenidad WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM amenidad WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['nombre','reglas','capacidad','requiere_aprobacion','tarifa']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE amenidad SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, nombre FROM amenidad WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM amenidad WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// reservas
router.get('/:id/reservas', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT id, inicio, fin, estado, unidad_id FROM reserva_amenidad WHERE amenidad_id = ? ORDER BY inicio DESC LIMIT 200', [id]); res.json(rows); });

/**
 * @openapi
 * /amenidades/{id}/reservas:
 *   post:
 *     tags: [Amenidades]
 *     summary: Crear reserva para una amenidad
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
 *               unidad_id:
 *                 type: integer
 *               persona_id:
 *                 type: integer
 *               inicio:
 *                 type: string
 *                 format: date-time
 *               fin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:id/reservas', [authenticate, body('unidad_id').isInt(), body('persona_id').isInt(), body('inicio').notEmpty(), body('fin').notEmpty()], async (req, res) => { const id = req.params.id; const { unidad_id, persona_id, inicio, fin } = req.body; try { const [result] = await db.query('INSERT INTO reserva_amenidad (comunidad_id, amenidad_id, unidad_id, persona_id, inicio, fin) SELECT comunidad_id, ?, ?, ?, ?, ? FROM amenidad WHERE id = ?',[id, id, unidad_id, persona_id, inicio, fin, id]); const [row] = await db.query('SELECT id, inicio, fin, estado FROM reserva_amenidad WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;
