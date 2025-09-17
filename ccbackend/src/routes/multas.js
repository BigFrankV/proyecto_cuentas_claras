const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * /unidades/{unidadId}/multas:
 *   get:
 *     tags: [Multas]
 *     summary: Listar multas de una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de multas
 */
router.get('/unidad/:unidadId', authenticate, async (req, res) => { const unidadId = req.params.unidadId; const [rows] = await db.query('SELECT id, motivo, monto, estado, fecha FROM multa WHERE unidad_id = ? ORDER BY fecha DESC LIMIT 200', [unidadId]); res.json(rows); });

/**
 * @openapi
 * /unidades/{unidadId}/multas:
 *   post:
 *     tags: [Multas]
 *     summary: Crear una multa para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
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
 *               motivo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/unidad/:unidadId', [authenticate, authorize('admin','superadmin'), body('motivo').notEmpty(), body('monto').isNumeric(), body('fecha').notEmpty()], async (req, res) => { const unidadId = req.params.unidadId; const { persona_id, motivo, descripcion, monto, fecha } = req.body; try { const [result] = await db.query('INSERT INTO multa (comunidad_id, unidad_id, persona_id, motivo, descripcion, monto, fecha) SELECT unidad.comunidad_id, ?, ?, ?, ?, ?, ? FROM unidad WHERE id = ?',[unidadId, persona_id || null, motivo, descripcion || null, monto, fecha, unidadId]); const [row] = await db.query('SELECT id, motivo, monto, estado FROM multa WHERE id = ? LIMIT 1',[result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM multa WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['estado','fecha_pago','monto','motivo','descripcion']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE multa SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, motivo, monto, estado FROM multa WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM multa WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// listar multas por comunidad (añadido)
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  try {
    const [rows] = await db.query(
      'SELECT id, unidad_id, persona_id, motivo, descripcion, monto, estado, fecha FROM multa WHERE comunidad_id = ? ORDER BY fecha DESC LIMIT 500',
      [comunidadId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// listado global (opcional, útil para /multas y /mod/multas)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, comunidad_id, unidad_id, persona_id, motivo, monto, estado, fecha FROM multa ORDER BY fecha DESC LIMIT 500'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// listado global / unidad / etc.
// Añadir: crear multa pasando persona_id (backend infiere unidad si es posible)
router.post('/', [authenticate, authorize('admin','superadmin'), body('monto').isNumeric().withMessage('monto requerido')], async (req, res) => {
  try {
    const { persona_id, unidad_id, motivo, descripcion, monto, fecha } = req.body || {}
    if (!persona_id && !unidad_id) return res.status(400).json({ error: 'persona_id o unidad_id requerido' })

    // si sólo viene persona_id, intentar inferir unidad desde la persona
    let targetUnidadId = unidad_id || null
    if (!targetUnidadId && persona_id) {
      const [prows] = await db.query('SELECT unidad_id FROM persona WHERE id = ? LIMIT 1', [persona_id])
      if (prows && prows.length) targetUnidadId = prows[0].unidad_id || null
    }

    if (!targetUnidadId) {
      return res.status(422).json({ error: 'No se pudo inferir unidad para la persona. Proveer unidad_id o asignar unidad a la persona.' })
    }

    const [result] = await db.query(
      'INSERT INTO multa (comunidad_id, unidad_id, persona_id, motivo, descripcion, monto, fecha, creado_por) SELECT unidad.comunidad_id, ?, ?, ?, ?, ?, ?, ? FROM unidad WHERE id = ?',
      [targetUnidadId, persona_id || null, motivo || null, descripcion || null, monto, fecha || new Date(), req.user?.id || null, targetUnidadId]
    )
    const [row] = await db.query('SELECT id, motivo, monto, estado, fecha FROM multa WHERE id = ? LIMIT 1', [result.insertId])
    res.status(201).json(row[0])
  } catch (err) {
    console.error('POST /multas error', err)
    res.status(500).json({ error: 'server error' })
  }
})

module.exports = router;
