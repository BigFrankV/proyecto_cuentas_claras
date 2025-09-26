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
 * /comunidades/{comunidadId}/centros-costo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listar centros de costo por comunidad
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query(`
    SELECT 
      id, 
      nombre, 
      descripcion, 
      departamento, 
      presupuesto, 
      ano_fiscal, 
      fecha_inicio, 
      fecha_fin, 
      activo, 
      color, 
      icono, 
      etiquetas,
      codigo,
      created_at, 
      updated_at 
    FROM centro_costo 
    WHERE comunidad_id = ? 
    ORDER BY created_at DESC 
    LIMIT 500
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @openapi
 * /comunidades/{comunidadId}/centros-costo:
 *   post:
 *     tags: [CentrosCosto]
 *     summary: Crear nuevo centro de costo
 */
router.post('/comunidad/:comunidadId', [
  authenticate, 
  requireCommunity('comunidadId', ['admin', 'superadmin']), 
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('departamento').optional(),
  body('descripcion').optional(),
  body('presupuesto').optional().isFloat({ min: 0 }).withMessage('Presupuesto debe ser un número positivo'),
  body('icono').optional(),
  body('color').optional()
], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  
  // Validar errores de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Datos de entrada inválidos', 
      details: errors.array() 
    });
  }
  
  const { 
    nombre, 
    descripcion, 
    departamento, 
    presupuesto, 
    icono, 
    color 
  } = req.body;
  
  try {
    // Generar código automáticamente si no se proporciona
    const codigo = `CC${Date.now().toString().slice(-6)}`;
    
    const [result] = await db.query(`
      INSERT INTO centro_costo (
        comunidad_id, 
        nombre, 
        descripcion, 
        departamento, 
        presupuesto, 
        ano_fiscal,
        activo, 
        color, 
        icono, 
        codigo
      ) VALUES (?, ?, ?, ?, ?, YEAR(NOW()), TRUE, ?, ?, ?)
    `, [
      comunidadId, 
      nombre, 
      descripcion || null, 
      departamento || null, 
      presupuesto || 0, 
      color || '#2196F3', 
      icono || 'account_balance_wallet', 
      codigo
    ]);
    
    // Obtener el registro creado
    const [rows] = await db.query(`
      SELECT 
        id, 
        nombre, 
        descripcion, 
        departamento, 
        presupuesto, 
        ano_fiscal, 
        fecha_inicio, 
        fecha_fin, 
        activo, 
        color, 
        icono, 
        etiquetas,
        codigo,
        created_at, 
        updated_at 
      FROM centro_costo 
      WHERE id = ? 
      LIMIT 1
    `, [result.insertId]);
    
    res.status(201).json(rows[0]);
    
  } catch (err) {
    console.error('Error creando centro de costo:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

/**
 * @openapi
 * /centros-costo/{id}/estadisticas:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Obtener estadísticas de centros de costo
 */
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
        SUM(COALESCE(presupuesto, 0)) as presupuesto_total,
        0 as gasto_total
      FROM centro_costo 
      WHERE comunidad_id = ?
    `, [comunidadId]);
    
    const [deptStats] = await db.query(`
      SELECT 
        departamento,
        COUNT(*) as count
      FROM centro_costo 
      WHERE comunidad_id = ? AND departamento IS NOT NULL
      GROUP BY departamento
    `, [comunidadId]);
    
    const departamentos = {};
    deptStats.forEach(row => {
      departamentos[row.departamento] = row.count;
    });
    
    const estadisticas = {
      total: stats[0].total,
      activos: stats[0].activos,
      inactivos: stats[0].inactivos,
      presupuesto_total: parseFloat(stats[0].presupuesto_total) || 0,
      gasto_total: 0, // TODO: Calcular desde tabla de gastos
      departamentos
    };
    
    res.json(estadisticas);
    
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /centros-costo/{id}:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Obtener centro de costo por ID
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = Number(req.params.id);
  
  try {
    const [rows] = await db.query(`
      SELECT 
        id, 
        nombre, 
        descripcion, 
        departamento, 
        presupuesto, 
        ano_fiscal, 
        fecha_inicio, 
        fecha_fin, 
        activo, 
        color, 
        icono, 
        etiquetas,
        codigo,
        comunidad_id,
        created_at, 
        updated_at 
      FROM centro_costo 
      WHERE id = ? 
      LIMIT 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    
    res.json(rows[0]);
    
  } catch (err) {
    console.error('Error obteniendo centro de costo:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /centros-costo/{id}:
 *   patch:
 *     tags: [CentrosCosto]
 *     summary: Actualizar centro de costo
 */
router.patch('/:id', [
  authenticate, 
  authorize('admin','superadmin'),
  body('nombre').optional().notEmpty().withMessage('Nombre no puede estar vacío'),
  body('descripcion').optional(),
  body('departamento').optional(),
  body('presupuesto').optional().isFloat({ min: 0 }).withMessage('Presupuesto debe ser un número positivo'),
  body('activo').optional().isBoolean(),
  body('icono').optional(),
  body('color').optional()
], async (req, res) => {
  const id = Number(req.params.id);
  
  // Validar errores de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Datos de entrada inválidos', 
      details: errors.array() 
    });
  }
  
  const updateFields = {};
  const allowedFields = [
    'nombre', 'descripcion', 'departamento', 'presupuesto', 
    'ano_fiscal', 'fecha_inicio', 'fecha_fin', 'activo', 
    'color', 'icono', 'etiquetas'
  ];
  
  // Construir campos a actualizar dinámicamente
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateFields[field] = req.body[field];
    }
  });
  
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }
  
  try {
    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(id);
    
    await db.query(`UPDATE centro_costo SET ${setClause} WHERE id = ?`, values);
    
    // Obtener el registro actualizado
    const [rows] = await db.query(`
      SELECT 
        id, 
        nombre, 
        descripcion, 
        departamento, 
        presupuesto, 
        ano_fiscal, 
        fecha_inicio, 
        fecha_fin, 
        activo, 
        color, 
        icono, 
        etiquetas,
        codigo,
        comunidad_id,
        created_at, 
        updated_at 
      FROM centro_costo 
      WHERE id = ? 
      LIMIT 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    
    res.json(rows[0]);
    
  } catch (err) {
    console.error('Error actualizando centro de costo:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /centros-costo/{id}:
 *   delete:
 *     tags: [CentrosCosto]
 *     summary: Eliminar centro de costo
 */
router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => {
  const id = Number(req.params.id);
  
  try {
    // Verificar si existen gastos asociados
    const [gastos] = await db.query('SELECT COUNT(*) as count FROM gasto WHERE centro_costo_id = ?', [id]);
    
    if (gastos[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el centro de costo porque tiene gastos asociados',
        details: `Existen ${gastos[0].count} gastos asociados a este centro de costo`
      });
    }
    
    const [result] = await db.query('DELETE FROM centro_costo WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }
    
    res.status(204).end();
    
  } catch (err) {
    console.error('Error eliminando centro de costo:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;