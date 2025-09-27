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
 *   - name: Proveedores
 *     description: Gestión de proveedores por comunidad
 */

// ✅ MEJORAR EL GET PRINCIPAL - AGREGAR ESTADÍSTICAS
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { page = 1, limit = 100, sort, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = 'SELECT id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at FROM proveedor WHERE comunidad_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM proveedor WHERE comunidad_id = ?';
    let params = [comunidadId];

    // Agregar búsqueda si existe
    if (search) {
      baseQuery += ' AND (razon_social LIKE ? OR rut LIKE ? OR email LIKE ?)';
      countQuery += ' AND (razon_social LIKE ? OR rut LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Agregar ordenamiento
    const sortField = sort === 'nombre' ? 'razon_social' : sort === 'fecha' ? 'created_at' : 'id';
    baseQuery += ` ORDER BY ${sortField} DESC LIMIT ? OFFSET ?`;

    // Ejecutar consultas
    const [rows] = await db.query(baseQuery, [...params, Number(limit), Number(offset)]);
    const [countResult] = await db.query(countQuery, params.slice(0, search ? 4 : 1));
    
    // Estadísticas
    const [estadisticas] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes,
        COALESCE(AVG(calificacion), 0) as calificacion_promedio
      FROM proveedor 
      WHERE comunidad_id = ?
    `, [comunidadId]);

    res.json({
      success: true,
      data: rows,
      estadisticas: estadisticas[0],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching proveedores:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ MEJORAR EL POST
router.post('/comunidad/:comunidadId', [
  authenticate, 
  requireCommunity('comunidadId', ['admin']), 
  body('rut').notEmpty().withMessage('RUT requerido'), 
  body('dv').notEmpty().withMessage('Dígito verificador requerido'), 
  body('razon_social').notEmpty().withMessage('Razón social requerida'),
  body('email').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Datos inválidos',
      details: errors.array()
    });
  }

  const comunidadId = Number(req.params.comunidadId);
  const { rut, dv, razon_social, giro, email, telefono, direccion, categorias } = req.body;

  try {
    // Verificar si ya existe
    const [existing] = await db.query('SELECT id FROM proveedor WHERE rut = ? AND dv = ? AND comunidad_id = ?', [rut, dv, comunidadId]);
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Ya existe un proveedor con este RUT' 
      });
    }

    // Insertar proveedor
    const [result] = await db.query(`
      INSERT INTO proveedor (
        comunidad_id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [comunidadId, rut, dv, razon_social, giro||null, email||null, telefono||null, direccion||null]);

    // Obtener el proveedor creado
    const [newProveedor] = await db.query(`
      SELECT id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at 
      FROM proveedor WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newProveedor[0],
      message: 'Proveedor creado exitosamente'
    });

  } catch (err) {
    console.error('Error creating proveedor:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM proveedor WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['rut','dv','razon_social','giro','email','telefono','direccion']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE proveedor SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, rut, dv, razon_social FROM proveedor WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM proveedor WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// ✅ AGREGAR ENDPOINT DE ESTADÍSTICAS
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);

  try {
    const [estadisticas] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes,
        COALESCE(AVG(calificacion), 0) as calificacion_promedio
      FROM proveedor 
      WHERE comunidad_id = ?
    `, [comunidadId]);

    res.json({
      success: true,
      data: estadisticas[0]
    });

  } catch (error) {
    console.error('Error fetching estadisticas:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ AGREGAR ENDPOINT DE BÚSQUEDA
router.get('/comunidad/:comunidadId/search', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ success: true, data: [] });
  }

  try {
    const searchTerm = `%${q.trim()}%`;
    const [rows] = await db.query(`
      SELECT id, rut, dv, razon_social, email, telefono, activo 
      FROM proveedor 
      WHERE comunidad_id = ? 
        AND activo = 1 
        AND (razon_social LIKE ? OR rut LIKE ? OR email LIKE ?)
      ORDER BY razon_social ASC
      LIMIT 20
    `, [comunidadId, searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error searching proveedores:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ AGREGAR TOGGLE DE ESTADO
router.patch('/:id/toggle', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = Number(req.params.id);

  try {
    // Obtener estado actual
    const [current] = await db.query('SELECT activo FROM proveedor WHERE id = ?', [id]);
    if (!current.length) {
      return res.status(404).json({ success: false, error: 'Proveedor no encontrado' });
    }

    const nuevoEstado = current[0].activo ? 0 : 1;
    
    // Actualizar estado
    await db.query('UPDATE proveedor SET activo = ? WHERE id = ?', [nuevoEstado, id]);

    res.json({
      success: true,
      data: { id, activo: nuevoEstado === 1 },
      message: `Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error toggling proveedor:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;