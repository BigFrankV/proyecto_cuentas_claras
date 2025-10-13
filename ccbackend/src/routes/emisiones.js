const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * /emisiones:
 *   get:
 *     tags: [Emisiones]
 *     summary: Listar todas las emisiones
 *     description: |
 *       Obtiene el historial completo de emisiones con filtros opcionales.
 *       Incluye información del período, monto total, estado y comunidad.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *         description: Registros por página
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de comunidad
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         description: 'Filtrar por período (ej: 2024-03)'
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, emitido, cerrado, anulado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde fecha
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta fecha
 *     responses:
 *       200:
 *         description: Lista de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       periodo:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       fechaEmision:
 *                         type: string
 *                       fechaVencimiento:
 *                         type: string
 *                       montoTotal:
 *                         type: number
 *                       montoPagado:
 *                         type: number
 *                       cantidadUnidades:
 *                         type: integer
 *                       descripcion:
 *                         type: string
 *                       nombreComunidad:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', authenticate, async (req, res) => {
  const { 
    page = 1, 
    limit = 20,
    comunidad_id,
    periodo,
    estado,
    fecha_desde,
    fecha_hasta
  } = req.query;
  
  const offset = (page - 1) * limit;
  
  try {
    // Construir filtros dinámicamente
    let whereConditions = [];
    let queryParams = [];
    
    if (comunidad_id) {
      whereConditions.push('egc.comunidad_id = ?');
      queryParams.push(comunidad_id);
    }
    
    if (periodo) {
      whereConditions.push('egc.periodo LIKE ?');
      queryParams.push(`%${periodo}%`);
    }
    
    if (estado) {
      whereConditions.push('egc.estado = ?');
      queryParams.push(estado);
    }
    
    if (fecha_desde) {
      whereConditions.push('egc.created_at >= ?');
      queryParams.push(fecha_desde);
    }
    
    if (fecha_hasta) {
      whereConditions.push('egc.created_at <= ?');
      queryParams.push(fecha_hasta);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Consulta principal usando la consulta SQL 1
    const [rows] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'gastos_comunes'
        END as tipo,
        CASE
          WHEN egc.estado = 'borrador' THEN 'draft'
          WHEN egc.estado = 'emitido' THEN 'sent'
          WHEN egc.estado = 'cerrado' THEN 'paid'
          WHEN egc.estado = 'anulado' THEN 'cancelled'
          ELSE 'ready'
        END as estado,
        DATE_FORMAT(egc.created_at, '%Y-%m-%d') as fechaEmision,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fechaVencimiento,
        COALESCE(SUM(ccu.monto_total), 0) as montoTotal,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as montoPagado,
        COUNT(DISTINCT ccu.unidad_id) as cantidadUnidades,
        egc.observaciones as descripcion,
        c.razon_social as nombreComunidad,
        egc.created_at,
        egc.updated_at
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      ${whereClause}
      GROUP BY egc.id, egc.periodo, egc.estado, egc.created_at, egc.fecha_vencimiento, egc.observaciones, c.razon_social, egc.updated_at
      ORDER BY egc.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, Number(limit), Number(offset)]);
    
    // Consulta de conteo usando la consulta SQL 2
    const [countResult] = await db.query(`
      SELECT COUNT(DISTINCT egc.id) as total
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      ${whereClause}
    `, queryParams);
    
    res.json({
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

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
  const comunidadId = req.params.comunidadId; 
  const { page=1, limit=100 } = req.query; 
  const offset = (page-1) * limit;
  
  try {
    // Consulta principal usando la consulta SQL 1
    const [rows] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'gastos_comunes'
        END as tipo,
        CASE
          WHEN egc.estado = 'borrador' THEN 'draft'
          WHEN egc.estado = 'emitido' THEN 'sent'
          WHEN egc.estado = 'cerrado' THEN 'paid'
          WHEN egc.estado = 'anulado' THEN 'cancelled'
          ELSE 'ready'
        END as estado,
        DATE_FORMAT(egc.created_at, '%Y-%m-%d') as fechaEmision,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fechaVencimiento,
        COALESCE(SUM(ccu.monto_total), 0) as montoTotal,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as montoPagado,
        COUNT(DISTINCT ccu.unidad_id) as cantidadUnidades,
        egc.observaciones as descripcion,
        c.razon_social as nombreComunidad,
        egc.created_at,
        egc.updated_at
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      WHERE egc.comunidad_id = ?
      GROUP BY egc.id, egc.periodo, egc.estado, egc.created_at, egc.fecha_vencimiento, egc.observaciones, c.razon_social, egc.updated_at
      ORDER BY egc.created_at DESC
      LIMIT ? OFFSET ?
    `, [comunidadId, Number(limit), Number(offset)]);
    
    // Consulta de conteo usando la consulta SQL 2
    const [countResult] = await db.query(`
      SELECT COUNT(DISTINCT egc.id) as total
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      WHERE egc.comunidad_id = ?
    `, [comunidadId]);
    
    res.json({
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
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
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // Crear emisión usando consulta SQL 9
    const [result] = await conn.query(`
      INSERT INTO emision_gastos_comunes (
        comunidad_id,
        periodo,
        fecha_vencimiento,
        estado,
        observaciones
      ) VALUES (
        ?, ?, ?, 'borrador', ?
      )
    `, [comunidadId, periodo, fecha_vencimiento, observaciones || null]);
    
    const emisionId = result.insertId;
    
    // Si se proporcionan detalles de gastos, insertarlos
    if (req.body.detalles && Array.isArray(req.body.detalles)) {
      for (const detalle of req.body.detalles) {
        await conn.query(`
          INSERT INTO detalle_emision_gastos (
            emision_id,
            gasto_id,
            categoria_id,
            monto,
            regla_prorrateo,
            metadata_json
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          emisionId,
          detalle.gasto_id || null,
          detalle.categoria_id,
          detalle.monto,
          detalle.regla_prorrateo || 'coeficiente',
          detalle.metadata_json || null
        ]);
      }
    }
    
    await conn.commit();
    
    const [row] = await conn.query('SELECT id, periodo, estado, fecha_vencimiento FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch(e){}
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch(e){}
  }
});

router.get('/:id', authenticate, async (req, res) => { 
  const id = req.params.id; 
  try {
    const [rows] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'gastos_comunes'
        END as tipo,
        CASE
          WHEN egc.estado = 'borrador' THEN 'draft'
          WHEN egc.estado = 'emitido' THEN 'sent'
          WHEN egc.estado = 'cerrado' THEN 'paid'
          WHEN egc.estado = 'anulado' THEN 'cancelled'
          ELSE 'ready'
        END as estado,
        DATE_FORMAT(egc.created_at, '%Y-%m-%d') as fechaEmision,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fechaVencimiento,
        COALESCE(SUM(ccu.monto_total), 0) as montoTotal,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as montoPagado,
        COUNT(DISTINCT ccu.unidad_id) as cantidadUnidades,
        egc.observaciones as descripcion,
        c.razon_social as nombreComunidad,
        -- Información adicional para intereses
        CASE WHEN egc.periodo LIKE '%Interes%' THEN 1 ELSE 0 END as tieneInteres,
        COALESCE(pc.tasa_mora_mensual, 2.0) as tasaInteres,
        COALESCE(pc.dias_gracia, 5) as periodoGracia,
        egc.created_at,
        egc.updated_at
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      LEFT JOIN parametros_cobranza pc ON c.id = pc.comunidad_id
      WHERE egc.id = ?
      GROUP BY egc.id, egc.periodo, egc.estado, egc.created_at, egc.fecha_vencimiento, egc.observaciones, c.razon_social, pc.tasa_mora_mensual, pc.dias_gracia, egc.updated_at
    `, [id]);
    
    if (!rows.length) return res.status(404).json({ error: 'not found' }); 
    res.json(rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { 
  const id = req.params.id; 
  if (!req.body.estado && !req.body.observaciones) return res.status(400).json({ error: 'estado or observaciones required' }); 
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const updates = [];
    const values = [];
    
    if (req.body.estado) {
      updates.push('estado = ?');
      values.push(req.body.estado);
    }
    
    if (req.body.observaciones !== undefined) {
      updates.push('observaciones = ?');
      values.push(req.body.observaciones);
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    await conn.query(`UPDATE emision_gastos_comunes SET ${updates.join(', ')} WHERE id = ?`, values);
    
    await conn.commit();
    
    const [rows] = await conn.query('SELECT id, periodo, estado, observaciones FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch(e){}
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch(e){}
  }
});

// add detalle
router.post('/:id/detalles', [authenticate, authorize('admin','superadmin'), body('categoria_id').isInt(), body('monto').isNumeric(), body('regla_prorrateo').notEmpty()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const emisionId = req.params.id; 
  const { gasto_id, categoria_id, monto, regla_prorrateo, metadata_json } = req.body;
  
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // Verificar que la emisión existe y está en estado borrador
    const [emRows] = await conn.query('SELECT estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'emision not found' });
    }
    
    if (emRows[0].estado !== 'borrador') {
      await conn.rollback();
      return res.status(400).json({ error: 'can only add details to draft emisiones' });
    }
    
    const [result] = await conn.query(`
      INSERT INTO detalle_emision_gastos (
        emision_id, 
        gasto_id, 
        categoria_id, 
        monto, 
        regla_prorrateo, 
        metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [emisionId, gasto_id || null, categoria_id, monto, regla_prorrateo, metadata_json || null]);
    
    await conn.commit();
    
    const [row] = await conn.query(`
      SELECT 
        id, 
        categoria_id, 
        monto, 
        regla_prorrateo,
        gasto_id,
        metadata_json
      FROM detalle_emision_gastos 
      WHERE id = ? LIMIT 1
    `, [result.insertId]);
    
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch(e){}
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch(e){}
  }
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

// ===========================================
// ENDPOINTS ADICIONALES BASADOS EN CONSULTAS SQL
// ===========================================

/**
 * @swagger
 * /emisiones/{id}/conceptos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener conceptos/prorrateo de una emisión
 *     description: Obtiene todos los conceptos y reglas de prorrateo asociados a una emisión específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de conceptos de la emisión
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   monto:
 *                     type: number
 *                   tipoDistribucion:
 *                     type: string
 *                     enum: [proporcional, igual, personalizado]
 *                   categoria:
 *                     type: string
 */
router.get('/:id/conceptos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        deg.id,
        cg.nombre as nombre,
        cg.nombre as descripcion,
        deg.monto as monto,
        CASE
          WHEN deg.regla_prorrateo = 'coeficiente' THEN 'proporcional'
          WHEN deg.regla_prorrateo = 'partes_iguales' THEN 'igual'
          WHEN deg.regla_prorrateo = 'consumo' THEN 'personalizado'
          WHEN deg.regla_prorrateo = 'fijo_por_unidad' THEN 'personalizado'
          ELSE 'proporcional'
        END as tipoDistribucion,
        cg.nombre as categoria,
        deg.created_at
      FROM detalle_emision_gastos deg
      JOIN categoria_gasto cg ON deg.categoria_id = cg.id
      WHERE deg.emision_id = ?
      ORDER BY deg.created_at
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/gastos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener gastos incluidos en una emisión
 *     description: Obtiene todos los gastos que conforman una emisión específica, incluyendo información del proveedor y documento.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de gastos de la emisión
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   descripcion:
 *                     type: string
 *                   monto:
 *                     type: number
 *                   categoria:
 *                     type: string
 *                   proveedor:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   documento:
 *                     type: string
 */
router.get('/:id/gastos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        g.id,
        g.glosa as descripcion,
        deg.monto as monto,
        cg.nombre as categoria,
        p.razon_social as proveedor,
        DATE_FORMAT(g.fecha, '%Y-%m-%d') as fecha,
        COALESCE(dc.folio, CONCAT('Gasto #', g.id)) as documento,
        g.created_at
      FROM detalle_emision_gastos deg
      JOIN gasto g ON deg.gasto_id = g.id
      JOIN categoria_gasto cg ON deg.categoria_id = cg.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE deg.emision_id = ?
      ORDER BY g.fecha DESC
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/unidades:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener unidades y prorrateo de una emisión
 *     description: Obtiene todas las unidades afectadas por una emisión con su prorrateo correspondiente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de unidades con prorrateo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   numero:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   propietario:
 *                     type: string
 *                   contacto:
 *                     type: string
 *                   participacion:
 *                     type: number
 *                   montoTotal:
 *                     type: number
 *                   montoPagado:
 *                     type: number
 *                   estado:
 *                     type: string
 */
router.get('/:id/unidades', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.codigo as numero,
        CASE
          WHEN u.m2_utiles > 0 THEN 'Departamento'
          WHEN u.nro_estacionamiento IS NOT NULL THEN 'Estacionamiento'
          WHEN u.nro_bodega IS NOT NULL THEN 'Bodega'
          ELSE 'Unidad'
        END as tipo,
        COALESCE(
          CONCAT(p.nombres, ' ', p.apellidos),
          'Sin asignar'
        ) as propietario,
        COALESCE(
          p.email,
          ''
        ) as contacto,
        u.alicuota as participacion,
        ccu.monto_total as montoTotal,
        (ccu.monto_total - ccu.saldo) as montoPagado,
        CASE
          WHEN ccu.estado = 'pagado' THEN 'paid'
          WHEN ccu.estado = 'parcial' THEN 'partial'
          WHEN ccu.estado = 'vencido' THEN 'pending'
          ELSE 'pending'
        END as estado,
        ccu.created_at
      FROM cuenta_cobro_unidad ccu
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE ccu.emision_id = ?
      ORDER BY u.codigo
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/pagos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener pagos realizados para una emisión
 *     description: Obtiene todos los pagos realizados por las unidades de una emisión específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de pagos de la emisión
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   monto:
 *                     type: number
 *                   metodo:
 *                     type: string
 *                   referencia:
 *                     type: string
 *                   unidad:
 *                     type: string
 *                   estado:
 *                     type: string
 */
router.get('/:id/pagos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') as fecha,
        pa.monto as monto,
        CASE
          WHEN p.medio = 'transferencia' THEN 'Transferencia'
          WHEN p.medio = 'webpay' THEN 'WebPay'
          WHEN p.medio = 'khipu' THEN 'Khipu'
          WHEN p.medio = 'servipag' THEN 'Servipag'
          WHEN p.medio = 'efectivo' THEN 'Efectivo'
          ELSE p.medio
        END as metodo,
        p.referencia as referencia,
        u.codigo as unidad,
        CASE
          WHEN p.estado = 'aplicado' THEN 'confirmed'
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'reversado' THEN 'rejected'
          ELSE 'pending'
        END as estado,
        p.created_at
      FROM pago_aplicacion pa
      JOIN pago p ON pa.pago_id = p.id
      JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
      JOIN unidad u ON ccu.unidad_id = u.id
      WHERE ccu.emision_id = ?
      ORDER BY p.fecha DESC, p.created_at DESC
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/historial:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener historial de cambios de una emisión
 *     description: Obtiene el historial de auditoría de cambios realizados a una emisión específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Historial de cambios de la emisión
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *                   accion:
 *                     type: string
 *                   usuario:
 *                     type: string
 *                   descripcion:
 *                     type: string
 */
router.get('/:id/historial', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        a.id,
        DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as fecha,
        CASE
          WHEN a.accion = 'INSERT' THEN 'Emisión creada'
          WHEN a.accion = 'UPDATE' THEN 'Emisión actualizada'
          WHEN a.accion = 'DELETE' THEN 'Emisión eliminada'
          ELSE CONCAT('Acción: ', a.accion)
        END as accion,
        COALESCE(u.username, 'Sistema') as usuario,
        CASE
          WHEN a.accion = 'INSERT' THEN 'Se creó la emisión'
          WHEN a.accion = 'UPDATE' THEN 'Se modificaron datos de la emisión'
          WHEN a.accion = 'DELETE' THEN 'Se eliminó la emisión'
          ELSE 'Cambio en emisión'
        END as descripcion,
        a.created_at
      FROM auditoria a
      LEFT JOIN usuario u ON a.usuario_id = u.id
      WHERE a.tabla = 'emision_gastos_comunes' AND a.registro_id = ?
      ORDER BY a.created_at DESC
    `, [emisionId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}:
 *   delete:
 *     tags: [Emisiones]
 *     summary: Eliminar una emisión
 *     description: Elimina completamente una emisión y todos sus datos relacionados (solo si está en estado borrador).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión a eliminar
 *     responses:
 *       200:
 *         description: Emisión eliminada exitosamente
 *       400:
 *         description: No se puede eliminar la emisión (estado no válido)
 *       404:
 *         description: Emisión no encontrada
 */
router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const emisionId = req.params.id;
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();
    
    // Verificar que la emisión existe y está en estado borrador
    const [emRows] = await conn.query('SELECT estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'emision not found' });
    }
    
    if (emRows[0].estado !== 'borrador') {
      await conn.rollback();
      return res.status(400).json({ error: 'only draft emisiones can be deleted' });
    }
    
    // Eliminar en orden inverso a la creación
    await conn.query('DELETE pa FROM pago_aplicacion pa JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id WHERE ccu.emision_id = ?', [emisionId]);
    await conn.query('DELETE FROM cuenta_cobro_unidad WHERE emision_id = ?', [emisionId]);
    await conn.query('DELETE FROM detalle_emision_gastos WHERE emision_id = ?', [emisionId]);
    await conn.query('DELETE FROM emision_gastos_comunes WHERE id = ?', [emisionId]);
    
    await conn.commit();
    res.json({ message: 'emision deleted successfully' });
  } catch (err) {
    console.error(err);
    try { await conn.rollback(); } catch(e){}
    res.status(500).json({ error: 'server error' });
  } finally {
    try { conn.release(); } catch(e){}
  }
});

/**
 * @swagger
 * /emisiones/estadisticas:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener estadísticas generales de emisiones
 *     description: Obtiene estadísticas generales y reportes de todas las emisiones del sistema.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generales:
 *                   type: object
 *                   properties:
 *                     total_emisiones:
 *                       type: integer
 *                     emitidas:
 *                       type: integer
 *                     cerradas:
 *                       type: integer
 *                     anuladas:
 *                       type: integer
 *                     monto_promedio:
 *                       type: number
 *                     monto_maximo:
 *                       type: number
 *                     monto_minimo:
 *                       type: number
 *                 por_mes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 cobranza:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/estadisticas', authenticate, authorize('admin','superadmin'), async (req, res) => {
  try {
    // Estadísticas generales
    const [generales] = await db.query(`
      SELECT
        COUNT(*) as total_emisiones,
        SUM(CASE WHEN estado = 'emitido' THEN 1 ELSE 0 END) as emitidas,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerradas,
        SUM(CASE WHEN estado = 'anulado' THEN 1 ELSE 0 END) as anuladas,
        AVG(total_monto) as monto_promedio,
        MAX(total_monto) as monto_maximo,
        MIN(total_monto) as monto_minimo
      FROM (
        SELECT
          egc.id,
          egc.estado,
          COALESCE(SUM(ccu.monto_total), 0) as total_monto
        FROM emision_gastos_comunes egc
        LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
        GROUP BY egc.id, egc.estado
      ) as emisiones_estadisticas
    `);
    
    // Emisiones por mes
    const [porMes] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as mes,
        estado,
        COUNT(*) as cantidad,
        SUM(total_monto) as monto_total
      FROM (
        SELECT
          egc.id,
          egc.estado,
          egc.created_at,
          COALESCE(SUM(ccu.monto_total), 0) as total_monto
        FROM emision_gastos_comunes egc
        LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
        GROUP BY egc.id, egc.estado, egc.created_at
      ) as emisiones_mes
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), estado
      ORDER BY mes DESC, estado
    `);
    
    // Cobranza por emisión
    const [cobranza] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        c.razon_social as comunidad,
        SUM(ccu.monto_total) as total_emitido,
        SUM(ccu.monto_total - ccu.saldo) as total_cobrado,
        ROUND((SUM(ccu.monto_total - ccu.saldo) / SUM(ccu.monto_total)) * 100, 2) as porcentaje_cobranza,
        COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as unidades_pagadas,
        COUNT(ccu.unidad_id) as total_unidades
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      WHERE egc.estado IN ('emitido', 'cerrado')
      GROUP BY egc.id, egc.periodo, c.razon_social
      ORDER BY egc.created_at DESC
    `);
    
    res.json({
      generales: generales[0],
      por_mes: porMes,
      cobranza: cobranza
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/validaciones:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener validaciones y verificaciones de una emisión
 *     description: Ejecuta varias validaciones para verificar la integridad de una emisión.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Resultados de validaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existe_emision:
 *                   type: boolean
 *                 gastos_validos:
 *                   type: object
 *                 cuentas_cobro:
 *                   type: object
 *                 cobertura_unidades:
 *                   type: object
 */
router.get('/:id/validaciones', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const validations = {};
    
    // Verificar si existe emisión para el período
    const [emRows] = await db.query('SELECT comunidad_id, periodo FROM emision_gastos_comunes WHERE id = ? LIMIT 1', [emisionId]);
    if (!emRows.length) {
      return res.status(404).json({ error: 'emision not found' });
    }
    
    const { comunidad_id, periodo } = emRows[0];
    
    // Verificar si ya existe emisión para el mismo período
    const [existe] = await db.query('SELECT COUNT(*) as existe_emision FROM emision_gastos_comunes WHERE comunidad_id = ? AND periodo = ? AND id != ?', [comunidad_id, periodo, emisionId]);
    validations.existe_emision = existe[0].existe_emision > 0;
    
    // Verificar gastos incluidos
    const [gastos] = await db.query(`
      SELECT
        COUNT(*) as total_gastos_incluidos,
        SUM(CASE WHEN g.id IS NULL THEN 1 ELSE 0 END) as gastos_inexistentes
      FROM detalle_emision_gastos deg
      LEFT JOIN gasto g ON deg.gasto_id = g.id
      WHERE deg.emision_id = ?
      GROUP BY deg.emision_id
    `, [emisionId]);
    validations.gastos_validos = gastos[0] || { total_gastos_incluidos: 0, gastos_inexistentes: 0 };
    
    // Verificar integridad de cuentas de cobro
    const [cuentas] = await db.query(`
      SELECT
        COUNT(*) as total_registros,
        SUM(CASE WHEN ccu.monto_total <= 0 THEN 1 ELSE 0 END) as montos_invalidos,
        SUM(CASE WHEN ccu.saldo > ccu.monto_total THEN 1 ELSE 0 END) as saldos_invalidos
      FROM cuenta_cobro_unidad ccu
      WHERE ccu.emision_id = ?
    `, [emisionId]);
    validations.cuentas_cobro = cuentas[0] || { total_registros: 0, montos_invalidos: 0, saldos_invalidos: 0 };
    
    // Verificar cobertura de unidades
    const [cobertura] = await db.query(`
      SELECT
        COUNT(DISTINCT u.id) as unidades_activas,
        COUNT(DISTINCT ccu.unidad_id) as unidades_con_cobro,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT ccu.unidad_id) as unidades_faltantes
      FROM unidad u
      LEFT JOIN cuenta_cobro_unidad ccu ON u.id = ccu.unidad_id AND ccu.emision_id = ?
      WHERE u.activa = 1 AND u.comunidad_id = ?
    `, [emisionId, comunidad_id]);
    validations.cobertura_unidades = cobertura[0] || { unidades_activas: 0, unidades_con_cobro: 0, unidades_faltantes: 0 };
    
    res.json(validations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


module.exports = router;
