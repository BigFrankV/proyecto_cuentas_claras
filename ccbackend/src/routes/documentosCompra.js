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
 *   - name: DocumentosCompra
 *     description: Documentos de compra (facturas, boletas)
 */

router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, tipo_doc, folio, fecha_emision, total FROM documento_compra WHERE comunidad_id = ? ORDER BY fecha_emision DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin','contador']), body('proveedor_id').isInt(), body('tipo_doc').notEmpty(), body('folio').notEmpty(), body('fecha_emision').notEmpty(), body('total').isNumeric()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId); const { proveedor_id, tipo_doc, folio, fecha_emision, neto=0, iva=0, exento=0, total, glosa } = req.body;
  try { const [result] = await db.query('INSERT INTO documento_compra (comunidad_id, proveedor_id, tipo_doc, folio, fecha_emision, neto, iva, exento, total, glosa) VALUES (?,?,?,?,?,?,?,?,?,?)', [comunidadId, proveedor_id, tipo_doc, folio, fecha_emision, neto, iva, exento, total, glosa || null]); const [row] = await db.query('SELECT id, tipo_doc, folio, fecha_emision, total FROM documento_compra WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM documento_compra WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['proveedor_id','tipo_doc','folio','fecha_emision','neto','iva','exento','total','glosa']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE documento_compra SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, tipo_doc, folio, fecha_emision, total FROM documento_compra WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM documento_compra WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

module.exports = router;