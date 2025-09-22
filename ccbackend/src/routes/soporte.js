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
 * /comunidades/{comunidadId}/tickets:
 *   get:
 *     tags: [Soporte]
 *     summary: Listar tickets de una comunidad
 */

// tickets list - requires belonging
router.get('/comunidad/:comunidadId/tickets', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, categoria, titulo, estado, prioridad FROM ticket WHERE comunidad_id = ? ORDER BY created_at DESC LIMIT 200', [comunidadId]);
  res.json(rows);
});

// crear ticket - cualquier miembro puede crear en su comunidad
router.post('/comunidad/:comunidadId/tickets', [authenticate, requireCommunity('comunidadId'), body('categoria').notEmpty(), body('titulo').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { unidad_id, categoria, titulo, descripcion, prioridad } = req.body;
  try {
    const [result] = await db.query('INSERT INTO ticket (comunidad_id, unidad_id, categoria, titulo, descripcion, prioridad) VALUES (?,?,?,?,?,?)', [comunidadId, unidad_id || null, categoria, titulo, descripcion || null, prioridad || 'media']);
    const [row] = await db.query('SELECT id, categoria, titulo, estado FROM ticket WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/tickets/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM ticket WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/tickets/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; const fields = ['estado','asignado_a','prioridad','titulo','descripcion']; const updates=[]; const values=[];
  fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id);
  try { await db.query(`UPDATE ticket SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, categoria, titulo, estado FROM ticket WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

/* Notificaciones, documentos, bitacora, parametros */
/* list documents, notifications, bitacora require membership */
router.get('/comunidad/:comunidadId/notificaciones', authenticate, requireCommunity('comunidadId'), async (req, res) => { const comunidadId = Number(req.params.comunidadId); const [rows] = await db.query('SELECT id, tipo, titulo, mensaje, leida FROM notificacion WHERE comunidad_id = ? ORDER BY fecha_creacion DESC LIMIT 200', [comunidadId]); res.json(rows); });

router.post('/comunidad/:comunidadId/notificaciones', [authenticate, requireCommunity('comunidadId', ['admin','conserje']), body('tipo').notEmpty(), body('titulo').notEmpty(), body('mensaje').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { persona_id, tipo, titulo, mensaje, objeto_tipo, objeto_id } = req.body;
  try { const [result] = await db.query('INSERT INTO notificacion (comunidad_id, persona_id, tipo, titulo, mensaje, objeto_tipo, objeto_id) VALUES (?,?,?,?,?,?,?)', [comunidadId, persona_id || null, tipo, titulo, mensaje, objeto_tipo || null, objeto_id || null]); const [row] = await db.query('SELECT id, tipo, titulo, mensagem FROM notificacion WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/comunidad/:comunidadId/documentos', authenticate, requireCommunity('comunidadId'), async (req, res) => { const comunidadId = Number(req.params.comunidadId); const [rows] = await db.query('SELECT id, tipo, titulo, url FROM documento WHERE comunidad_id = ? ORDER BY created_at DESC LIMIT 200', [comunidadId]); res.json(rows); });

router.post('/comunidad/:comunidadId/documentos', [authenticate, requireCommunity('comunidadId', ['admin','superadmin']), body('tipo').notEmpty(), body('titulo').notEmpty(), body('url').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { tipo, titulo, url, periodo, visibilidad } = req.body;
  try { const [result] = await db.query('INSERT INTO documento (comunidad_id, tipo, titulo, url, periodo, visibilidad) VALUES (?,?,?,?,?,?)', [comunidadId, tipo, titulo, url, periodo || null, visibilidad || 'privado']); const [row] = await db.query('SELECT id, tipo, titulo, url FROM documento WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.delete('/documentos/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM documento WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.get('/comunidad/:comunidadId/bitacora', authenticate, requireCommunity('comunidadId'), async (req, res) => { const comunidadId = Number(req.params.comunidadId); const [rows] = await db.query('SELECT id, fecha_hora, evento, detalle FROM bitacora_conserjeria WHERE comunidad_id = ? ORDER BY fecha_hora DESC LIMIT 500', [comunidadId]); res.json(rows); });

router.post('/comunidad/:comunidadId/bitacora', [authenticate, requireCommunity('comunidadId', ['conserje','admin']), body('evento').notEmpty(), body('fecha_hora').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { fecha_hora, usuario_id, evento, detalle } = req.body;
  try { const [result] = await db.query('INSERT INTO bitacora_conserjeria (comunidad_id, fecha_hora, usuario_id, evento, detalle) VALUES (?,?,?,?,?)', [comunidadId, fecha_hora, usuario_id || null, evento, detalle || null]); const [row] = await db.query('SELECT id, fecha_hora, evento FROM bitacora_conserjeria WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/comunidad/:comunidadId/parametros-cobranza', authenticate, requireCommunity('comunidadId'), async (req, res) => { const comunidadId = Number(req.params.comunidadId); const [rows] = await db.query('SELECT * FROM parametros_cobranza WHERE comunidad_id = ? LIMIT 1', [comunidadId]); res.json(rows[0] || null); });

router.patch('/comunidad/:comunidadId/parametros-cobranza', [authenticate, requireCommunity('comunidadId', ['admin','contador'])], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const fields = ['dias_gracia','tasa_mora_mensual','mora_calculo','redondeo','interes_max_mensual','aplica_interes_sobre'];
  const updates=[]; const values=[];
  fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }});
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(comunidadId);
  try { await db.query(`UPDATE parametros_cobranza SET ${updates.join(', ')} WHERE comunidad_id = ?`, values); const [rows] = await db.query('SELECT * FROM parametros_cobranza WHERE comunidad_id = ? LIMIT 1',[comunidadId]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;