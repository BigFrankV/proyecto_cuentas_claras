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
 * - name: Gastos
 * description: Gastos y su registro
 */

// Listar gastos por comunidad (solo si pertenece)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  // Se podría usar la consulta avanzada 1.2 del archivo CONSULTAS_GASTOS.sql
  const { page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;
  
  // Usando consulta 1.1 de CONSULTAS_GASTOS.sql
  const query = `
    SELECT g.id, g.categoria_id, cat.nombre AS categoria_nombre, g.fecha, g.monto, g.glosa, 
           p.razon_social AS proveedor_nombre, dc.folio AS documento_numero 
    FROM gasto g
    INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
    LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
    LEFT JOIN proveedor p ON dc.proveedor_id = p.id
    WHERE g.comunidad_id = ? 
    ORDER BY g.fecha DESC LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(query, [comunidadId, Number(limit), Number(offset)]);
  res.json(rows);
});

// Crear gasto en comunidad (admin/contador de la comunidad o superadmin)
router.post('/comunidad/:comunidadId', [
  authenticate,
  requireCommunity('comunidadId', ['admin', 'contador']),
  body('categoria_id').isInt(),
  body('fecha').notEmpty(),
  body('monto').isNumeric()
], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comunidadId = Number(req.params.comunidadId);
  const { categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario } = req.body;
  try {
    // Usando consulta 3.1 de CONSULTAS_GASTOS.sql
    const [result] = await db.query('INSERT INTO gasto (comunidad_id, categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario) VALUES (?,?,?,?,?,?,?,?)', [comunidadId, categoria_id, centro_costo_id || null, documento_compra_id || null, fecha, monto, glosa || null, extraordinario ? 1 : 0]);
    
    // Usando lógica de 2.1 para retorno detallado
    const [row] = await db.query(`
      SELECT g.id, cat.nombre as categoria, g.fecha, g.monto, g.glosa
      FROM gasto g JOIN categoria_gasto cat ON g.categoria_id = cat.id
      WHERE g.id = ? LIMIT 1
    `, [result.insertId]);
    
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id; 
  // Usando consulta 2.1 de CONSULTAS_GASTOS.sql (adaptada) para obtener detalle completo
  const query = `
    SELECT 
      g.id, g.comunidad_id, c.razon_social AS comunidad_nombre, g.categoria_id, 
      cat.nombre AS categoria_nombre, g.fecha, g.monto, g.glosa, g.extraordinario,
      p.razon_social AS proveedor_nombre, dc.folio AS documento_numero
    FROM gasto g
    INNER JOIN comunidad c ON g.comunidad_id = c.id
    INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
    LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
    LEFT JOIN proveedor p ON dc.proveedor_id = p.id
    WHERE g.id = ? LIMIT 1
  `;
  const [rows] = await db.query(query, [id]);

  if (!rows.length) return res.status(404).json({ error: 'not found' }); 
  res.json(rows[0]);
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; const fields = ['categoria_id','centro_costo_id','documento_compra_id','fecha','monto','glosa','extraordinario']; const updates=[]; const values=[];
  fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }});
  if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id);
  try { 
    // Usando consulta 3.2 (adaptada) de CONSULTAS_GASTOS.sql
    await db.query(`UPDATE gasto SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values); 
    
    const [rows] = await db.query('SELECT id, categoria_id, fecha, monto FROM gasto WHERE id = ? LIMIT 1',[id]); 
    res.json(rows[0]); 
  } catch (err) { 
    console.error(err); res.status(500).json({ error: 'server error' }); 
  }
});

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => {
  const id = req.params.id; 
  try { 
    // Usando consulta 3.3 (adaptada) de CONSULTAS_GASTOS.sql
    await db.query('DELETE FROM gasto WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch (err) { 
    console.error(err); res.status(500).json({ error: 'server error' }); 
  }
});

module.exports = router;