const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

/**
 * @openapi
 * tags:
 *   - name: CategoriasGasto
 *     description: Gestión de categorías de gasto por comunidad
 */

// Middleware de permisos para categorías
const checkCategoriaPermission = (action) => {
  return async (req, res, next) => {
    try {
      const comunidadId = req.params.comunidadId;
      
      const [membership] = await db.query(`
        SELECT rol FROM membresia_comunidad 
        WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
      `, [comunidadId, req.user.persona_id]);

      if (!membership.length) {
        return res.status(403).json({ error: 'No tiene permisos en esta comunidad' });
      }

      const rol = membership[0].rol;

      const permissions = {
        'read': ['admin', 'contador', 'comite', 'residente', 'propietario'],
        'create': ['admin', 'contador'],
        'update': ['admin', 'contador'],
        'delete': ['admin']
      };

      if (!permissions[action]?.includes(rol)) {
        return res.status(403).json({ error: `No tiene permisos para ${action}` });
      }

      next();
    } catch (error) {
      console.error('Error checking categoria permissions:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

/**
 * @openapi
 * /api/categorias-gasto/comunidad/{comunidadId}:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Listar categorías de gasto activas para una comunidad
 */
router.get('/comunidad/:comunidadId', [
  authenticate, 
  checkCategoriaPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { incluir_inactivas = false } = req.query;
    
    // ✅ CONSULTA CORREGIDA - Arreglar ambigüedad
    let baseWhereClause = 'WHERE (cg.comunidad_id = ? OR cg.comunidad_id IS NULL)';
    const params = [comunidadId];

    if (!incluir_inactivas || incluir_inactivas === 'false') {
      baseWhereClause += ' AND cg.activa = 1';
    }

    const query = `
      SELECT 
        cg.id,
        cg.nombre,
        cg.tipo,
        cg.cta_contable,
        cg.activa,
        cg.comunidad_id,
        cg.created_at,
        cg.updated_at,
        COUNT(g.id) as total_gastos,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') THEN g.monto ELSE 0 END), 0) as monto_total,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') AND YEAR(g.fecha) = YEAR(CURDATE()) THEN g.monto ELSE 0 END), 0) as monto_anio_actual
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id AND g.comunidad_id = cg.comunidad_id
      ${baseWhereClause}
      GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable, cg.activa, cg.comunidad_id, cg.created_at, cg.updated_at
      ORDER BY cg.nombre ASC
    `;

    const [rows] = await db.query(query, params);
    
    const categorias = rows.map(categoria => ({
      ...categoria,
      activa: !!categoria.activa,
      monto_total: parseFloat(categoria.monto_total || 0),
      monto_anio_actual: parseFloat(categoria.monto_anio_actual || 0),
      es_global: categoria.comunidad_id === null
    }));

    res.json({
      success: true,
      data: categorias
    });

  } catch (error) {
    console.error('Error fetching categorias:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error obteniendo categorías',
      message: error.message 
    });
  }
});

/**
 * @openapi
 * /api/categorias-gasto/comunidad/{comunidadId}:
 *   post:
 *     tags: [CategoriasGasto]
 *     summary: Crear nueva categoría para una comunidad
 */
router.post('/comunidad/:comunidadId', [
  authenticate,
  checkCategoriaPermission('create'),
  body('nombre').notEmpty().isLength({ min: 3, max: 100 }).withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  body('tipo').isIn(['operacional', 'extraordinario', 'fondo_reserva', 'multas', 'consumo']).withMessage('Tipo inválido'),
  body('cta_contable').optional().isString().isLength({ max: 20 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Datos inválidos', 
      details: errors.array() 
    });
  }

  const conexion = await db.getConnection();
  
  try {
    await conexion.beginTransaction();
    
    const comunidadId = Number(req.params.comunidadId);
    const { nombre, tipo, cta_contable } = req.body;

    // Verificar que no existe una categoría con el mismo nombre en esta comunidad
    const [existing] = await conexion.query(
      'SELECT id FROM categoria_gasto WHERE comunidad_id = ? AND LOWER(nombre) = LOWER(?)',
      [comunidadId, nombre.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ya existe una categoría con ese nombre en esta comunidad' 
      });
    }

    // Insertar nueva categoría
    const [result] = await conexion.query(`
      INSERT INTO categoria_gasto (comunidad_id, nombre, tipo, cta_contable, activa, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, NOW(), NOW())
    `, [comunidadId, nombre.trim(), tipo, cta_contable?.trim() || null]);

    // Registrar en auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'CREATE', 'categoria_gasto', ?, ?, ?, NOW())
    `, [
      req.user.id, 
      result.insertId,
      JSON.stringify({ nombre, tipo, cta_contable, comunidad_id: comunidadId }),
      req.ip || req.connection.remoteAddress
    ]);

    // Obtener categoría recién creada
    const [categoria] = await conexion.query(
      'SELECT * FROM categoria_gasto WHERE id = ?',
      [result.insertId]
    );

    await conexion.commit();
    
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: {
        ...categoria[0],
        activa: !!categoria[0].activa,
        es_global: false,
        total_gastos: 0,
        monto_total: 0,
        monto_anio_actual: 0
      }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error creating categoria:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear categoría',
      message: error.message 
    });
  } finally {
    conexion.release();
  }
});

/**
 * @openapi
 * /api/categorias-gasto/{id}:
 *   put:
 *     tags: [CategoriasGasto]
 *     summary: Actualizar categoría
 */
router.put('/:id', [
  authenticate,
  body('nombre').optional().isLength({ min: 3, max: 100 }),
  body('tipo').optional().isIn(['operacional', 'extraordinario', 'fondo_reserva', 'multas', 'consumo']),
  body('cta_contable').optional().isString().isLength({ max: 20 }),
  body('activa').optional().isBoolean()
], async (req, res) => {
  const conexion = await db.getConnection();
  
  try {
    await conexion.beginTransaction();
    
    const categoryId = Number(req.params.id);
    const { nombre, tipo, cta_contable, activa } = req.body;

    // Obtener categoría actual y verificar permisos
    const [categoriaActual] = await conexion.query(`
      SELECT cg.*, mc.rol 
      FROM categoria_gasto cg
      LEFT JOIN membresia_comunidad mc ON cg.comunidad_id = mc.comunidad_id 
        AND mc.persona_id = ? AND mc.activo = 1
      WHERE cg.id = ? AND (cg.comunidad_id IS NULL OR mc.rol IN ('admin', 'contador'))
    `, [req.user.persona_id, categoryId]);

    if (!categoriaActual.length) {
      return res.status(404).json({ 
        success: false, 
        error: 'Categoría no encontrada o sin permisos' 
      });
    }

    const categoria = categoriaActual[0];

    // Si es una categoría global, solo superadmin puede modificar
    if (categoria.comunidad_id === null && !req.user.is_superadmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Solo el superadmin puede modificar categorías globales' 
      });
    }

    // Construir query de actualización dinámicamente
    const updates = [];
    const values = [];

    if (nombre !== undefined && nombre.trim() !== categoria.nombre) {
      // Verificar que no existe otra categoría con este nombre
      const [existing] = await conexion.query(`
        SELECT id FROM categoria_gasto 
        WHERE comunidad_id = ? AND LOWER(nombre) = LOWER(?) AND id != ?
      `, [categoria.comunidad_id, nombre.trim(), categoryId]);

      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ya existe otra categoría con ese nombre' 
        });
      }

      updates.push('nombre = ?');
      values.push(nombre.trim());
    }

    if (tipo !== undefined) {
      updates.push('tipo = ?');
      values.push(tipo);
    }

    if (cta_contable !== undefined) {
      updates.push('cta_contable = ?');
      values.push(cta_contable?.trim() || null);
    }

    if (activa !== undefined) {
      // Si se está desactivando, verificar que no tenga gastos pendientes
      if (!activa) {
        const [gastosPendientes] = await conexion.query(`
          SELECT COUNT(*) as count FROM gasto 
          WHERE categoria_id = ? AND estado IN ('borrador', 'pendiente_aprobacion')
        `, [categoryId]);

        if (gastosPendientes[0].count > 0) {
          return res.status(400).json({ 
            success: false, 
            error: `No se puede desactivar la categoría porque tiene ${gastosPendientes[0].count} gastos pendientes` 
          });
        }
      }

      updates.push('activa = ?');
      values.push(activa ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No hay campos para actualizar' 
      });
    }

    updates.push('updated_at = NOW()');
    values.push(categoryId);

    // Ejecutar actualización
    await conexion.query(
      `UPDATE categoria_gasto SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Registrar en auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
      VALUES (?, 'UPDATE', 'categoria_gasto', ?, ?, ?, NOW())
    `, [
      req.user.id, 
      categoryId,
      JSON.stringify(categoria),
      JSON.stringify(req.body),
      req.ip || req.connection.remoteAddress
    ]);

    // Obtener categoría actualizada
    const [categoriaActualizada] = await conexion.query(`
      SELECT 
        cg.*,
        COUNT(g.id) as total_gastos,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') THEN g.monto ELSE 0 END), 0) as monto_total
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.id = ?
      GROUP BY cg.id
    `, [categoryId]);

    await conexion.commit();
    
    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: {
        ...categoriaActualizada[0],
        activa: !!categoriaActualizada[0].activa,
        monto_total: parseFloat(categoriaActualizada[0].monto_total || 0),
        es_global: categoriaActualizada[0].comunidad_id === null
      }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error updating categoria:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar categoría',
      message: error.message 
    });
  } finally {
    conexion.release();
  }
});

module.exports = router;