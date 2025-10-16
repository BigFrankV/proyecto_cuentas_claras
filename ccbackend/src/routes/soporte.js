// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Soporte
 *     description: |
 *       Sistema de tickets y registro de conserjería.
 *       
 *       **Cambio de nomenclatura**: La tabla `ticket` ahora se llama `solicitud_soporte`.
 *       Permite a residentes reportar problemas, solicitudes y gestionar el registro de conserjería.
 */

/**
 * @swagger
 * /soporte/comunidad/{comunidadId}/tickets:
 *   get:
 *     tags: [Soporte]
 *     summary: Listar solicitudes de soporte de una comunidad
 *     description: |
 *       Obtiene las últimas 200 solicitudes de soporte de una comunidad.
 *       Cualquier miembro de la comunidad puede consultar los tickets.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de solicitudes de soporte
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   categoria:
 *                     type: string
 *                     example: "mantenimiento"
 *                   titulo:
 *                     type: string
 *                   estado:
 *                     type: string
 *                     enum: [abierto, en_progreso, resuelto, cerrado]
 *                   prioridad:
 *                     type: string
 *                     enum: [baja, media, alta, urgente]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

// tickets list - requires belonging (actualizado a solicitud_soporte)
router.get('/comunidad/:comunidadId/tickets', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, categoria, titulo, estado, prioridad FROM ticket_soporte WHERE comunidad_id = ? ORDER BY created_at DESC LIMIT 200', [comunidadId]);
  res.json(rows);
});

/**
 * @swagger
 * /soporte/comunidad/{comunidadId}/tickets:
 *   post:
 *     tags: [Soporte]
 *     summary: Crear una nueva solicitud de soporte
 *     description: |
 *       Cualquier miembro de la comunidad puede crear un ticket de soporte.
 *       Se registra automáticamente con estado "abierto".
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoria
 *               - titulo
 *             properties:
 *               unidad_id:
 *                 type: integer
 *                 description: ID de la unidad relacionada (opcional)
 *               categoria:
 *                 type: string
 *                 description: Categoría del ticket
 *                 example: "mantenimiento"
 *               titulo:
 *                 type: string
 *                 description: Título descriptivo del problema
 *                 example: "Fuga de agua en el pasillo"
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada (opcional)
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta, urgente]
 *                 default: media
 *                 description: Nivel de prioridad
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 categoria:
 *                   type: string
 *                 titulo:
 *                   type: string
 *                 estado:
 *                   type: string
 *       400:
 *         description: Datos inválidos (falta categoría o título)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

// crear ticket - cualquier miembro puede crear en su comunidad
router.post('/comunidad/:comunidadId/tickets', [authenticate, requireCommunity('comunidadId'), body('categoria').notEmpty(), body('titulo').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { unidad_id, categoria, titulo, descripcion, prioridad } = req.body;
  try {
    const [result] = await db.query('INSERT INTO ticket_soporte (comunidad_id, unidad_id, categoria, titulo, descripcion, prioridad) VALUES (?,?,?,?,?,?)', [comunidadId, unidad_id || null, categoria, titulo, descripcion || null, prioridad || 'media']);
    const [row] = await db.query('SELECT id, categoria, titulo, estado FROM ticket_soporte WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/tickets/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM ticket_soporte WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/tickets/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; const fields = ['estado','asignado_a','prioridad','titulo','descripcion']; const updates=[]; const values=[];
  fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id);
  try { await db.query(`UPDATE ticket_soporte SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, categoria, titulo, estado FROM ticket_soporte WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

/* Notificaciones, documentos, bitacora, parametros */
/* list documents, notifications, bitacora require membership */
router.get('/comunidad/:comunidadId/notificaciones', authenticate, requireCommunity('comunidadId'), async (req, res) => { const comunidadId = Number(req.params.comunidadId); const [rows] = await db.query('SELECT id, tipo, titulo, mensaje, leida FROM notificacion_usuario WHERE comunidad_id = ? ORDER BY fecha_creacion DESC LIMIT 200', [comunidadId]); res.json(rows); });

router.post('/comunidad/:comunidadId/notificaciones', [authenticate, requireCommunity('comunidadId', ['admin','conserje']), body('tipo').notEmpty(), body('titulo').notEmpty(), body('mensaje').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { persona_id, tipo, titulo, mensaje, objeto_tipo, objeto_id } = req.body;
  try { const [result] = await db.query('INSERT INTO notificacion_usuario (comunidad_id, persona_id, tipo, titulo, mensaje, objeto_tipo, objeto_id) VALUES (?,?,?,?,?,?,?)', [comunidadId, persona_id || null, tipo, titulo, mensaje, objeto_tipo || null, objeto_id || null]); const [row] = await db.query('SELECT id, tipo, titulo, mensagem FROM notificacion_usuario WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/comunidad/:comunidadId/documentos', authenticate, requireCommunity('comunidadId'), async (req, res) => { const comunidadId = Number(req.params.comunidadId); const [rows] = await db.query('SELECT id, tipo, titulo, url FROM documento_comunidad WHERE comunidad_id = ? ORDER BY created_at DESC LIMIT 200', [comunidadId]); res.json(rows); });

router.post('/comunidad/:comunidadId/documentos', [authenticate, requireCommunity('comunidadId', ['admin','superadmin']), body('tipo').notEmpty(), body('titulo').notEmpty(), body('url').notEmpty()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { tipo, titulo, url, periodo, visibilidad } = req.body;
  try { const [result] = await db.query('INSERT INTO documento_comunidad (comunidad_id, tipo, titulo, url, periodo, visibilidad) VALUES (?,?,?,?,?,?)', [comunidadId, tipo, titulo, url, periodo || null, visibilidad || 'privado']); const [row] = await db.query('SELECT id, tipo, titulo, url FROM documento_comunidad WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.delete('/documentos/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM documento_comunidad WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

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



// // =========================================
// // ENDPOINTS DE SOPORTE
// // =========================================

// // TICKETS
// GET: /soporte/comunidad/:comunidadId/tickets
// POST: /soporte/comunidad/:comunidadId/tickets
// GET: /soporte/tickets/:id
// PATCH: /soporte/tickets/:id

// // NOTIFICACIONES
// GET: /soporte/comunidad/:comunidadId/notificaciones
// POST: /soporte/comunidad/:comunidadId/notificaciones

// // DOCUMENTOS
// GET: /soporte/comunidad/:comunidadId/documentos
// POST: /soporte/comunidad/:comunidadId/documentos
// DELETE: /soporte/documentos/:id

// // BITÁCORA DE CONSERJERÍA
// GET: /soporte/comunidad/:comunidadId/bitacora
// POST: /soporte/comunidad/:comunidadId/bitacora

// // PARÁMETROS DE COBRANZA
// GET: /soporte/comunidad/:comunidadId/parametros-cobranza
// PATCH: /soporte/comunidad/:comunidadId/parametros-cobranza