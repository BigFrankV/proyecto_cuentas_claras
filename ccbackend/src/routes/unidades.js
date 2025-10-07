// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * tags:
 *   - name: Unidades
 *     description: Gestión de unidades
 */

// List unidades por comunidad (miembros)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT 
      u.id, 
      u.codigo, 
      u.edificio_id, 
      u.torre_id,
      e.nombre as edificio_nombre,
      t.nombre as torre_nombre,
      u.alicuota, 
      u.activa 
    FROM unidad u
    LEFT JOIN edificio e ON e.id = u.edificio_id
    LEFT JOIN torre t ON t.id = u.torre_id
    WHERE u.comunidad_id = ? 
    LIMIT 500
  `, [comunidadId]);
  res.json(rows);
});

// Crear unidad en comunidad (admin de comunidad)
router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin']), body('codigo').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { edificio_id, torre_id, codigo, alicuota, m2_utiles, m2_terrazas, nro_bodega, nro_estacionamiento, activa } = req.body;
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

// GET /unidades/:id etc (kept)
router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM unidad WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['edificio_id','torre_id','codigo','alicuota','m2_utiles','m2_terrazas','nro_bodega','nro_estacionamiento','activa']; const updates = []; const values = []; fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { if (req.body.edificio_id !== undefined && req.body.torre_id !== undefined) { return res.status(400).json({ error: 'provide at most one of edificio_id or torre_id' }); } await db.query(`UPDATE unidad SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT * FROM unidad WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'codigo must be unique per comunidad' }); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM unidad WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

/* titulares / residentes endpoints - actualizado para usar titulares_unidad */
router.get('/:id/tenencias', authenticate, async (req, res) => { const unidadId = req.params.id; const { activo } = req.query; try { let sql = 'SELECT t.id, t.persona_id, t.tipo, t.desde, t.hasta, t.porcentaje, p.nombres, p.apellidos, p.email FROM titulares_unidad t LEFT JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? ORDER BY t.desde DESC'; const params = [unidadId]; const [rows] = await db.query(sql, params); const today = new Date().toISOString().slice(0,10); if (activo === '1') { return res.json(rows.filter(r => (!r.hasta || r.hasta >= today))); } res.json(rows); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.post('/:id/tenencias', [authenticate, authorize('admin','superadmin'), body('persona_id').isInt(), body('tipo').notEmpty(), body('desde').notEmpty()], async (req, res) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); const unidadId = req.params.id; const { persona_id, tipo, desde, hasta, porcentaje } = req.body; try { const [urows] = await db.query('SELECT comunidad_id FROM unidad WHERE id = ? LIMIT 1', [unidadId]); if (!urows.length) return res.status(404).json({ error: 'unidad not found' }); const comunidad_id = urows[0].comunidad_id; const [result] = await db.query('INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, hasta, porcentaje) VALUES (?,?,?,?,?,?,?)', [comunidad_id, unidadId, persona_id, tipo, desde, hasta || null, porcentaje || 100.00]); const [row] = await db.query('SELECT id, persona_id, tipo, desde, hasta, porcentaje FROM titulares_unidad WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.get('/:id/residentes', authenticate, async (req, res) => { const unidadId = req.params.id; try { const today = new Date().toISOString().slice(0,10); const [rows] = await db.query("SELECT p.id, p.rut, p.dv, p.nombres, p.apellidos, t.tipo, t.desde, t.hasta, t.porcentaje FROM titulares_unidad t JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? AND t.tipo IN ('propietario','arrendatario') AND (t.hasta IS NULL OR t.hasta >= ?) ORDER BY t.desde DESC", [unidadId, today]); res.json(rows); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;