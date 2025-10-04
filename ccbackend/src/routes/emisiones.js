const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   - name: Emisiones
 *     description: |
 *       Gestión de emisiones de gastos comunes mensuales.
 *       
 *       **Cambios importantes**:
 *       - La tabla `emision_gasto_comun` ahora se llama `emision_gastos_comunes`
 *       - Los detalles se guardan en `detalle_emision` (antes `emision_gasto_comun_detalle`)
 *       
 *       Una emisión consolida todos los gastos del mes y genera las cuentas de cobro para cada unidad.
 */

/**
 * @swagger
 * /emisiones/comunidad/{comunidadId}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Listar emisiones de una comunidad
 *     description: |
 *       Obtiene el historial de emisiones de gastos comunes de una comunidad.
 *       Incluye información del período, monto total y estado de cada emisión.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-03"
 *                   fecha_emision:
 *                     type: string
 *                     format: date
 *                   monto_total:
 *                     type: number
 *                     description: Suma de todos los gastos del período
 *                   estado:
 *                     type: string
 *                     enum: [borrador, emitida, cerrada]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId; const { page=1, limit=100 } = req.query; const offset=(page-1)*limit;
  const [rows] = await db.query('SELECT id, periodo, estado, fecha_vencimiento FROM emision_gastos_comunes WHERE comunidad_id = ? ORDER BY periodo DESC LIMIT ? OFFSET ?', [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

/**
 * @openapi
 * /comunidades/{comunidadId}/emisiones:
 *   post:
 *     tags: [Emisiones]
 *     summary: Crear una emisión (gasto común)
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
 *               periodo:
 *                 type: string
 *               fecha_vencimiento:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/comunidad/:comunidadId', [authenticate, authorize('admin','superadmin'), body('periodo').notEmpty(), body('fecha_vencimiento').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = req.params.comunidadId; const { periodo, fecha_vencimiento, observaciones } = req.body;
  try { const [result] = await db.query('INSERT INTO emision_gastos_comunes (comunidad_id, periodo, fecha_vencimiento, observaciones) VALUES (?,?,?,?)', [comunidadId, periodo, fecha_vencimiento, observaciones || null]); const [row] = await db.query('SELECT id, periodo, estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.estado) return res.status(400).json({ error: 'estado required' }); try { await db.query('UPDATE emision_gastos_comunes SET estado = ? WHERE id = ?', [req.body.estado, id]); const [rows] = await db.query('SELECT id, periodo, estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// add detalle
router.post('/:id/detalles', [authenticate, authorize('admin','superadmin'), body('categoria_id').isInt(), body('monto').isNumeric(), body('regla_prorrateo').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const emisionId = req.params.id; const { gasto_id, categoria_id, monto, regla_prorrateo, metadata_json } = req.body;
  try { const [result] = await db.query('INSERT INTO detalle_emision_gastos (emision_id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json) VALUES (?,?,?,?,?,?)', [emisionId, gasto_id || null, categoria_id, monto, regla_prorrateo, metadata_json || null]); const [row] = await db.query('SELECT id, categoria_id, monto, regla_prorrateo FROM detalle_emision_gastos WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// preview prorrateo - stub: return example distribution
router.get('/:id/previsualizar-prorrateo', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    // load emision and detalles
    const [emRows] = await db.query('SELECT comunidad_id, periodo FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) return res.status(404).json({ error: 'emision not found' });
    const comunidadId = emRows[0].comunidad_id;
    const [detalles] = await db.query('SELECT id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json FROM detalle_emision_gastos WHERE emision_id = ?', [emisionId]);

    // load unidades for comunidad
    const [unidades] = await db.query('SELECT id, codigo, alicuota FROM unidad WHERE comunidad_id = ? AND activa = 1', [comunidadId]);
    if (!unidades.length) return res.status(200).json({ preview: [], note: 'no active unidades' });

    const totalAlicuota = unidades.reduce((s,u) => s + Number(u.alicuota || 0), 0) || 0;
    const nUnits = unidades.length;

    // prepare preview structure: map unidadId => { detalleId -> monto }
    const preview = unidades.map(u => ({ unidad_id: u.id, codigo: u.codigo, distribucion: [], total: 0 }));

    for (const d of detalles) {
      const rule = d.regla_prorrateo || 'partes_iguales';
      if (rule === 'consumo') {
        // consumption requires medidor readings — mark as requires data
        // For now we cannot compute consumption-based prorrateo without readings.
        return res.json({ preview: [], note: 'consumo-based prorrateo requires medidor data; not implemented in preview' });
      }

      if (rule === 'coeficiente') {
        // distribute by alicuota proportionally
        for (const p of preview) {
          const unidad = unidades.find(u => u.id === p.unidad_id);
          const share = totalAlicuota > 0 ? (Number(unidad.alicuota || 0) / totalAlicuota) * Number(d.monto) : 0;
          const val = Number(share.toFixed(2));
          p.distribucion.push({ detalle_id: d.id, monto: val });
          p.total = Number((p.total + val).toFixed(2));
        }
      } else if (rule === 'fijo_por_unidad' || rule === 'partes_iguales') {
        // equal split among units
        const per = Number((Number(d.monto) / nUnits).toFixed(2));
        // adjust rounding remainder to first unit
        let remainder = Number(d.monto) - per * nUnits;
        for (let i = 0; i < preview.length; i++) {
          let val = per;
          if (remainder !== 0 && i === 0) { val = Number((val + remainder).toFixed(2)); }
          preview[i].distribucion.push({ detalle_id: d.id, monto: val });
          preview[i].total = Number((preview[i].total + val).toFixed(2));
        }
      } else {
        // unknown rule: skip
        continue;
      }
    }

    res.json({ preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// generar cargos - stub
router.post('/:id/generar-cargos', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const emisionId = req.params.id;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [emRows] = await conn.query('SELECT comunidad_id FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) { await conn.rollback(); return res.status(404).json({ error: 'emision not found' }); }
    const comunidadId = emRows[0].comunidad_id;

    const [detalles] = await conn.query('SELECT id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json FROM detalle_emision_gastos WHERE emision_id = ?', [emisionId]);
    const [unidades] = await conn.query('SELECT id, codigo, alicuota FROM unidad WHERE comunidad_id = ? AND activa = 1', [comunidadId]);
    if (!unidades.length) { await conn.rollback(); return res.status(400).json({ error: 'no active unidades' }); }

    // compute preview using same logic as preview endpoint
    const totalAlicuota = unidades.reduce((s,u) => s + Number(u.alicuota || 0), 0) || 0;
    const nUnits = unidades.length;
    const distrib = unidades.map(u => ({ unidad_id: u.id, detalles: [], total: 0 }));

    for (const d of detalles) {
      const rule = d.regla_prorrateo || 'partes_iguales';
      if (rule === 'consumo') {
        await conn.rollback();
        return res.status(400).json({ error: 'consumo-based prorrateo requires medidor data; not supported in generate' });
      }
      if (rule === 'coeficiente') {
        for (const p of distrib) {
          const unidad = unidades.find(u => u.id === p.unidad_id);
          const share = totalAlicuota > 0 ? (Number(unidad.alicuota || 0) / totalAlicuota) * Number(d.monto) : 0;
          const val = Number(share.toFixed(2));
          p.detalles.push({ detalle_id: d.id, monto: val, categoria_id: d.categoria_id, gasto_id: d.gasto_id });
          p.total = Number((p.total + val).toFixed(2));
        }
      } else if (rule === 'fijo_por_unidad' || rule === 'partes_iguales') {
        const per = Number((Number(d.monto) / nUnits).toFixed(2));
        let remainder = Number(d.monto) - per * nUnits;
        for (let i = 0; i < distrib.length; i++) {
          let val = per;
          if (remainder !== 0 && i === 0) { val = Number((val + remainder).toFixed(2)); }
          distrib[i].detalles.push({ detalle_id: d.id, monto: val, categoria_id: d.categoria_id, gasto_id: d.gasto_id });
          distrib[i].total = Number((distrib[i].total + val).toFixed(2));
        }
      }
    }

    // create cuenta_cobro_unidad rows and detalle_cuenta_unidad
    const created = [];
    for (const d of distrib) {
      const [r] = await conn.query('INSERT INTO cuenta_cobro_unidad (emision_id, comunidad_id, unidad_id, monto_total, saldo) VALUES (?,?,?,?,?)', [emisionId, comunidadId, d.unidad_id, d.total, d.total]);
      const cuentaId = r.insertId;
      for (const det of d.detalles) {
        await conn.query('INSERT INTO detalle_cuenta_unidad (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, origen_id, iva_incluido) VALUES (?,?,?,?,?,?,?)', [cuentaId, det.categoria_id, `detalle ${det.detalle_id}`, det.monto, 'gasto', det.gasto_id || null, 1]);
      }
      created.push({ unidad_id: d.unidad_id, cuenta_cobro_unidad_id: cuentaId, monto_total: d.total });
    }

    await conn.commit();
    res.status(201).json({ ok: true, created });
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch(e){}
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch(e){}
  }
});

module.exports = router;
