const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Medidores
 *     description: Gestión de medidores y lecturas
 */

/**
 * @openapi
 * /medidores/comunidad/{comunidadId}:
 *   get:
 *     tags: [Medidores]
 *     summary: Listar medidores de una comunidad
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
 *         description: Lista de medidores
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => { const comunidadId = req.params.comunidadId; const [rows] = await db.query('SELECT id, tipo, codigo, es_compartido FROM medidor WHERE comunidad_id = ? LIMIT 500', [comunidadId]); res.json(rows); });

/**
 * @openapi
 * /medidores/comunidad/{comunidadId}:
 *   post:
 *     tags: [Medidores]
 *     summary: Crear medidor en comunidad
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
 *               unidad_id:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               codigo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('tipo').notEmpty(), body('codigo').notEmpty()], async (req, res) => { const comunidadId = req.params.comunidadId; const { unidad_id, tipo, codigo, es_compartido } = req.body; try { const [result] = await db.query('INSERT INTO medidor (comunidad_id, unidad_id, tipo, codigo, es_compartido) VALUES (?,?,?,?,?)', [comunidadId, unidad_id || null, tipo, codigo, es_compartido ? 1 : 0]); const [row] = await db.query('SELECT id, tipo, codigo FROM medidor WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM medidor WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['unidad_id','tipo','codigo','es_compartido']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE medidor SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT * FROM medidor WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM medidor WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// lecturas
router.get('/:id/lecturas', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT id, fecha, lectura, periodo FROM lectura_medidor WHERE medidor_id = ? ORDER BY periodo DESC LIMIT 200', [id]); res.json(rows); });

/**
 * @openapi
 * /medidores/{id}/lecturas:
 *   post:
 *     tags: [Medidores]
 *     summary: Agregar lectura a un medidor
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
 *               fecha:
 *                 type: string
 *               lectura:
 *                 type: number
 *               periodo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:id/lecturas', [authenticate, authorize('admin','superadmin'), body('fecha').notEmpty(), body('lectura').notEmpty(), body('periodo').notEmpty()], async (req, res) => { const id = req.params.id; const { fecha, lectura, periodo } = req.body; try { const [result] = await db.query('INSERT INTO lectura_medidor (medidor_id, fecha, lectura, periodo) VALUES (?,?,?,?)', [id, fecha, lectura, periodo]); const [row] = await db.query('SELECT id, fecha, lectura, periodo FROM lectura_medidor WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// consumos stub
router.get('/:id/consumos', authenticate, async (req, res) => { const id = req.params.id; const { desde, hasta } = req.query; res.json({ note: 'stub: calcular consumos entre periodos', desde, hasta }); });

module.exports = router;
