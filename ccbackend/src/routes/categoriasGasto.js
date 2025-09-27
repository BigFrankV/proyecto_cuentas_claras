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

// ✅ MIDDLEWARE MEJORADO - Soporte para SuperAdmin y múltiples escenarios
const checkCategoriaPermission = (action) => {
  return async (req, res, next) => {
    try {
      // SuperAdmin tiene acceso total
      if (req.user.rol_global === 'super_admin' || req.user.is_superadmin) {
        req.userRole = 'super_admin';
        return next();
      }

      const comunidadId = req.params.comunidadId || req.body.comunidad_id;

      if (!comunidadId) {
        return res.status(400).json({
          success: false,
          error: 'ID de comunidad requerido'
        });
      }

      // Verificar membresía en la comunidad
      const [membership] = await db.query(`
        SELECT rol FROM membresia_comunidad 
        WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
      `, [comunidadId, req.user.persona_id]);

      if (!membership.length) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos en esta comunidad'
        });
      }

      const rol = membership[0].rol;
      req.userRole = rol;

      // ✅ PERMISOS MEJORADOS
      const permissions = {
        'read': ['admin', 'administrador', 'tesorero', 'contador', 'comite', 'residente', 'propietario'],
        'create': ['admin', 'administrador', 'tesorero', 'contador', 'comite'],
        'update': ['admin', 'administrador', 'tesorero', 'contador', 'comite'],
        'delete': ['admin', 'administrador'],
        'toggle': ['admin', 'administrador', 'tesorero']
      };

      if (!permissions[action]?.includes(rol)) {
        return res.status(403).json({
          success: false,
          error: `No tiene permisos para ${action} categorías`
        });
      }

      next();
    } catch (error) {
      console.error('Error checking categoria permissions:', error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor al verificar permisos',
        message: error.message
      });
    }
  };
};

// ✅ NUEVO ENDPOINT - Para SuperAdmin ver todas las categorías
/**
 * @openapi
 * /api/categorias-gasto:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Listar todas las categorías (solo SuperAdmin)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Solo SuperAdmin puede ver todas las categorías
    if (req.user.rol_global !== 'super_admin' && !req.user.is_superadmin) {
      return res.status(403).json({
        success: false,
        error: 'Solo el SuperAdmin puede ver todas las categorías'
      });
    }

    const { incluir_inactivas = false, comunidad_id } = req.query;

    let whereClause = '';
    const params = [];

    // Filtrar por comunidad específica si se proporciona
    if (comunidad_id && comunidad_id !== '0') {
      whereClause = 'WHERE (cg.comunidad_id = ? OR cg.comunidad_id IS NULL)';
      params.push(Number(comunidad_id));
    }

    // Filtrar por activas/inactivas
    if (!incluir_inactivas || incluir_inactivas === 'false') {
      whereClause += whereClause ? ' AND cg.activa = 1' : 'WHERE cg.activa = 1';
    }

    // ✅ CONSULTA CORREGIDA - Eliminar el JOIN problemático con gasto
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
        c.razon_social as comunidad_nombre,
        0 as total_gastos,
        0 as monto_total,
        0 as monto_anio_actual
      FROM categoria_gasto cg
      LEFT JOIN comunidad c ON cg.comunidad_id = c.id
      ${whereClause}
      ORDER BY c.razon_social ASC, cg.nombre ASC
    `;

    console.log('🔍 SuperAdmin query:', query);
    console.log('🔍 SuperAdmin params:', params);

    const [rows] = await db.query(query, params);

    const categorias = rows.map(categoria => ({
      ...categoria,
      activa: !!categoria.activa,
      monto_total: parseFloat(categoria.monto_total || 0),
      monto_anio_actual: parseFloat(categoria.monto_anio_actual || 0),
      es_global: categoria.comunidad_id === null
    }));

    // ✅ ESTADÍSTICAS MEJORADAS
    const estadisticas = {
      total: categorias.length,
      activas: categorias.filter(c => c.activa).length,
      inactivas: categorias.filter(c => !c.activa).length,
      operacionales: categorias.filter(c => c.tipo === 'operacional').length,
      extraordinarias: categorias.filter(c => c.tipo === 'extraordinario').length,
      fondo_reserva: categorias.filter(c => c.tipo === 'fondo_reserva').length,
      multas: categorias.filter(c => c.tipo === 'multas').length,
      consumo: categorias.filter(c => c.tipo === 'consumo').length,
      total_gastos: categorias.reduce((sum, c) => sum + (c.total_gastos || 0), 0),
      monto_total: categorias.reduce((sum, c) => sum + (c.monto_total || 0), 0)
    };

    console.log('✅ SuperAdmin categorías encontradas:', categorias.length);

    res.json({
      success: true,
      data: categorias,
      estadisticas
    });

  } catch (error) {
    console.error('❌ Error fetching all categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo todas las categorías',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @openapi
 * /api/categorias-gasto/comunidad/{comunidadId}:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Listar categorías de gasto para una comunidad específica
 */
router.get('/comunidad/:comunidadId', [
  authenticate,
  checkCategoriaPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { incluir_inactivas = false } = req.query;

    // ✅ QUERY MEJORADA - Incluir categorías globales + específicas de la comunidad
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
        COUNT(DISTINCT g.id) as total_gastos,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') THEN g.monto ELSE 0 END), 0) as monto_total,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') AND YEAR(g.fecha) = YEAR(CURDATE()) THEN g.monto ELSE 0 END), 0) as monto_anio_actual
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id AND (g.comunidad_id = ? OR cg.comunidad_id IS NULL)
      ${baseWhereClause}
      GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable, cg.activa, cg.comunidad_id, cg.created_at, cg.updated_at
      ORDER BY cg.comunidad_id IS NULL DESC, cg.nombre ASC
    `;

    const [rows] = await db.query(query, [comunidadId, ...params]);

    const categorias = rows.map(categoria => ({
      ...categoria,
      activa: !!categoria.activa,
      monto_total: parseFloat(categoria.monto_total || 0),
      monto_anio_actual: parseFloat(categoria.monto_anio_actual || 0),
      es_global: categoria.comunidad_id === null
    }));

    // ✅ ESTADÍSTICAS POR COMUNIDAD
    const estadisticas = {
      total: categorias.length,
      activas: categorias.filter(c => c.activa).length,
      inactivas: categorias.filter(c => !c.activa).length,
      operacionales: categorias.filter(c => c.tipo === 'operacional').length,
      extraordinarias: categorias.filter(c => c.tipo === 'extraordinario').length,
      fondo_reserva: categorias.filter(c => c.tipo === 'fondo_reserva').length,
      multas: categorias.filter(c => c.tipo === 'multas').length,
      consumo: categorias.filter(c => c.tipo === 'consumo').length,
      total_gastos: categorias.reduce((sum, c) => sum + (c.total_gastos || 0), 0),
      monto_total: categorias.reduce((sum, c) => sum + (c.monto_total || 0), 0)
    };

    res.json({
      success: true,
      data: categorias,
      estadisticas
    });

  } catch (error) {
    console.error('Error fetching categorias for comunidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías de la comunidad',
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
  body('nombre').notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('Nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  body('tipo').isIn(['operacional', 'extraordinario', 'fondo_reserva', 'multas', 'consumo'])
    .withMessage('Tipo debe ser: operacional, extraordinario, fondo_reserva, multas o consumo'),
  body('cta_contable').optional().isString().isLength({ max: 20 })
    .withMessage('Cuenta contable no puede exceder 20 caracteres').trim()
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

    // ✅ VALIDACIÓN MEJORADA - Verificar comunidad existe
    const [comunidadExists] = await conexion.query(
      'SELECT id FROM comunidad WHERE id = ?',
      [comunidadId]
    );

    if (!comunidadExists.length) {
      return res.status(404).json({
        success: false,
        error: 'La comunidad especificada no existe'
      });
    }

    // ✅ VALIDACIÓN DE DUPLICADOS MEJORADA
    const [existing] = await conexion.query(
      `SELECT id FROM categoria_gasto 
       WHERE comunidad_id = ? AND LOWER(TRIM(nombre)) = LOWER(TRIM(?))`,
      [comunidadId, nombre]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre en esta comunidad'
      });
    }

    // ✅ VALIDACIÓN DE CUENTA CONTABLE
    if (cta_contable && cta_contable.trim()) {
      const ctaPattern = /^\d{4,10}$/;
      if (!ctaPattern.test(cta_contable.trim())) {
        return res.status(400).json({
          success: false,
          error: 'La cuenta contable debe contener solo números (4-10 dígitos)'
        });
      }
    }

    // Insertar nueva categoría
    const [result] = await conexion.query(`
      INSERT INTO categoria_gasto (comunidad_id, nombre, tipo, cta_contable, activa, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, NOW(), NOW())
    `, [comunidadId, nombre.trim(), tipo, cta_contable?.trim() || null]);

    // ✅ AUDITORÍA MEJORADA
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'CREATE', 'categoria_gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      result.insertId,
      JSON.stringify({
        nombre: nombre.trim(),
        tipo,
        cta_contable: cta_contable?.trim() || null,
        comunidad_id: comunidadId
      }),
      req.ip || req.connection?.remoteAddress || 'unknown'
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
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Obtener una categoría específica
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    const [categoria] = await db.query(`
      SELECT 
        cg.*,
        c.razon_social as comunidad_nombre,
        COUNT(DISTINCT g.id) as total_gastos,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') THEN g.monto ELSE 0 END), 0) as monto_total,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') AND YEAR(g.fecha) = YEAR(CURDATE()) THEN g.monto ELSE 0 END), 0) as monto_anio_actual
      FROM categoria_gasto cg
      LEFT JOIN comunidad c ON cg.comunidad_id = c.id
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.id = ?
      GROUP BY cg.id
    `, [categoryId]);

    if (!categoria.length) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    // ✅ VERIFICAR PERMISOS DE LECTURA
    const cat = categoria[0];
    const userCanView = req.user.rol_global === 'super_admin' || req.user.is_superadmin ||
      cat.comunidad_id === null || // Global
      await hasPermissionInComunidad(req.user.persona_id, cat.comunidad_id, 'read');

    if (!userCanView) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para ver esta categoría'
      });
    }

    res.json({
      success: true,
      data: {
        ...cat,
        activa: !!cat.activa,
        monto_total: parseFloat(cat.monto_total || 0),
        monto_anio_actual: parseFloat(cat.monto_anio_actual || 0),
        es_global: cat.comunidad_id === null
      }
    });

  } catch (error) {
    console.error('Error fetching categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categoría',
      message: error.message
    });
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
  body('nombre').optional().isLength({ min: 3, max: 100 }).withMessage('Nombre debe tener entre 3 y 100 caracteres').trim(),
  body('tipo').optional().isIn(['operacional', 'extraordinario', 'fondo_reserva', 'multas', 'consumo']).withMessage('Tipo inválido'),
  body('cta_contable').optional().isString().isLength({ max: 20 }).withMessage('Cuenta contable máximo 20 caracteres').trim(),
  body('activa').optional().isBoolean().withMessage('Activa debe ser verdadero o falso')
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

    const categoryId = Number(req.params.id);
    const { nombre, tipo, cta_contable, activa } = req.body;

    // ✅ OBTENER Y VERIFICAR CATEGORÍA
    const [categoriaActual] = await conexion.query(`
      SELECT cg.* FROM categoria_gasto cg WHERE cg.id = ?
    `, [categoryId]);

    if (!categoriaActual.length) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    const categoria = categoriaActual[0];

    // ✅ VERIFICAR PERMISOS MEJORADOS
    let hasPermission = false;

    if (req.user.rol_global === 'super_admin' || req.user.is_superadmin) {
      hasPermission = true;
    } else if (categoria.comunidad_id === null) {
      // Categorías globales solo las puede modificar superadmin
      hasPermission = false;
    } else {
      // Verificar permisos en la comunidad
      const [membership] = await conexion.query(`
        SELECT rol FROM membresia_comunidad 
        WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
      `, [categoria.comunidad_id, req.user.persona_id]);

      hasPermission = membership.length > 0 &&
        ['admin', 'administrador', 'tesorero', 'contador'].includes(membership[0].rol);
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para modificar esta categoría'
      });
    }

    // ✅ VALIDACIONES ANTES DE ACTUALIZAR
    const updates = [];
    const values = [];
    let cambios = {};

    if (nombre !== undefined && nombre.trim() !== categoria.nombre) {
      // Verificar duplicados
      const [existing] = await conexion.query(`
        SELECT id FROM categoria_gasto 
        WHERE comunidad_id = ? AND LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id != ?
      `, [categoria.comunidad_id, nombre, categoryId]);

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe otra categoría con ese nombre en esta comunidad'
        });
      }

      updates.push('nombre = ?');
      values.push(nombre.trim());
      cambios.nombre = { anterior: categoria.nombre, nuevo: nombre.trim() };
    }

    if (tipo !== undefined && tipo !== categoria.tipo) {
      updates.push('tipo = ?');
      values.push(tipo);
      cambios.tipo = { anterior: categoria.tipo, nuevo: tipo };
    }

    if (cta_contable !== undefined) {
      const newCta = cta_contable?.trim() || null;
      if (newCta !== categoria.cta_contable) {
        // Validar formato si no está vacía
        if (newCta && !/^\d{4,10}$/.test(newCta)) {
          return res.status(400).json({
            success: false,
            error: 'La cuenta contable debe contener solo números (4-10 dígitos)'
          });
        }

        updates.push('cta_contable = ?');
        values.push(newCta);
        cambios.cta_contable = { anterior: categoria.cta_contable, nuevo: newCta };
      }
    }

    if (activa !== undefined) {
      const newActiva = !!activa;
      if (newActiva !== !!categoria.activa) {
        // Si se está desactivando, verificar gastos pendientes
        if (!newActiva) {
          const [gastosPendientes] = await conexion.query(`
            SELECT COUNT(*) as count FROM gasto 
            WHERE categoria_id = ? AND estado IN ('borrador', 'pendiente_aprobacion', 'pendiente')
          `, [categoryId]);

          if (gastosPendientes[0].count > 0) {
            return res.status(400).json({
              success: false,
              error: `No se puede desactivar la categoría porque tiene ${gastosPendientes[0].count} gastos pendientes de aprobación`
            });
          }
        }

        updates.push('activa = ?');
        values.push(newActiva ? 1 : 0);
        cambios.activa = { anterior: !!categoria.activa, nuevo: newActiva };
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay cambios para actualizar'
      });
    }

    // ✅ EJECUTAR ACTUALIZACIÓN
    updates.push('updated_at = NOW()');
    values.push(categoryId);

    await conexion.query(
      `UPDATE categoria_gasto SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // ✅ AUDITORÍA DETALLADA
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
      VALUES (?, 'UPDATE', 'categoria_gasto', ?, ?, ?, ?, NOW())
    `, [
      req.user.id,
      categoryId,
      JSON.stringify(categoria),
      JSON.stringify(cambios),
      req.ip || req.connection?.remoteAddress || 'unknown'
    ]);

    // ✅ OBTENER CATEGORÍA ACTUALIZADA
    const [categoriaActualizada] = await conexion.query(`
      SELECT 
        cg.*,
        COUNT(DISTINCT g.id) as total_gastos,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') THEN g.monto ELSE 0 END), 0) as monto_total,
        COALESCE(SUM(CASE WHEN g.estado IN ('aprobado', 'pagado') AND YEAR(g.fecha) = YEAR(CURDATE()) THEN g.monto ELSE 0 END), 0) as monto_anio_actual
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
        monto_anio_actual: parseFloat(categoriaActualizada[0].monto_anio_actual || 0),
        es_global: categoriaActualizada[0].comunidad_id === null
      },
      cambios
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

/**
 * @openapi
 * /api/categorias-gasto/{id}/toggle:
 *   patch:
 *     tags: [CategoriasGasto]
 *     summary: Activar/Desactivar categoría
 */
router.patch('/:id/toggle', authenticate, async (req, res) => {
  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    const categoryId = Number(req.params.id);

    // Obtener categoría actual
    const [categoriaActual] = await conexion.query(
      'SELECT * FROM categoria_gasto WHERE id = ?',
      [categoryId]
    );

    if (!categoriaActual.length) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    const categoria = categoriaActual[0];
    const newStatus = !categoria.activa;

    // ✅ VERIFICAR PERMISOS
    let hasPermission = false;

    if (req.user.rol_global === 'super_admin' || req.user.is_superadmin) {
      hasPermission = true;
    } else if (categoria.comunidad_id !== null) {
      const [membership] = await conexion.query(`
        SELECT rol FROM membresia_comunidad 
        WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
      `, [categoria.comunidad_id, req.user.persona_id]);

      hasPermission = membership.length > 0 &&
        ['admin', 'administrador', 'tesorero'].includes(membership[0].rol);
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para cambiar el estado de esta categoría'
      });
    }

    // Si se está desactivando, verificar gastos pendientes
    if (!newStatus) {
      const [gastosPendientes] = await conexion.query(`
        SELECT COUNT(*) as count FROM gasto 
        WHERE categoria_id = ? AND estado IN ('borrador', 'pendiente_aprobacion', 'pendiente')
      `, [categoryId]);

      if (gastosPendientes[0].count > 0) {
        return res.status(400).json({
          success: false,
          error: `No se puede desactivar la categoría porque tiene ${gastosPendientes[0].count} gastos pendientes`
        });
      }
    }

    // Actualizar estado
    await conexion.query(
      'UPDATE categoria_gasto SET activa = ?, updated_at = NOW() WHERE id = ?',
      [newStatus ? 1 : 0, categoryId]
    );

    // Auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'TOGGLE', 'categoria_gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      categoryId,
      JSON.stringify({ activa: newStatus }),
      req.ip || req.connection?.remoteAddress || 'unknown'
    ]);

    await conexion.commit();

    res.json({
      success: true,
      message: `Categoría ${newStatus ? 'activada' : 'desactivada'} exitosamente`,
      data: {
        id: categoryId,
        activa: newStatus
      }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error toggling categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar estado de categoría',
      message: error.message
    });
  } finally {
    conexion.release();
  }
});

/**
 * @openapi
 * /api/categorias-gasto/{id}:
 *   delete:
 *     tags: [CategoriasGasto]
 *     summary: Eliminar categoría (solo si no tiene gastos)
 */
router.delete('/:id', authenticate, async (req, res) => {
  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    const categoryId = Number(req.params.id);

    // Obtener categoría y verificar existencia
    const [categoriaActual] = await conexion.query(
      'SELECT * FROM categoria_gasto WHERE id = ?',
      [categoryId]
    );

    if (!categoriaActual.length) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    const categoria = categoriaActual[0];

    // ✅ VERIFICAR PERMISOS (solo admin puede eliminar)
    let hasPermission = false;

    if (req.user.rol_global === 'super_admin' || req.user.is_superadmin) {
      hasPermission = true;
    } else if (categoria.comunidad_id !== null) {
      const [membership] = await conexion.query(`
        SELECT rol FROM membresia_comunidad 
        WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
      `, [categoria.comunidad_id, req.user.persona_id]);

      hasPermission = membership.length > 0 &&
        ['admin', 'administrador'].includes(membership[0].rol);
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden eliminar categorías'
      });
    }

    // Verificar que no tenga gastos asociados
    const [gastosAsociados] = await conexion.query(
      'SELECT COUNT(*) as count FROM gasto WHERE categoria_id = ?',
      [categoryId]
    );

    if (gastosAsociados[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede eliminar la categoría porque tiene ${gastosAsociados[0].count} gastos asociados`
      });
    }

    // No se pueden eliminar categorías globales
    if (categoria.comunidad_id === null) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden eliminar categorías globales'
      });
    }

    // Eliminar categoría
    await conexion.query('DELETE FROM categoria_gasto WHERE id = ?', [categoryId]);

    // Auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address, created_at)
      VALUES (?, 'DELETE', 'categoria_gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      categoryId,
      JSON.stringify(categoria),
      req.ip || req.connection?.remoteAddress || 'unknown'
    ]);

    await conexion.commit();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      data: { id: categoryId }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error deleting categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar categoría',
      message: error.message
    });
  } finally {
    conexion.release();
  }
});

// ✅ FUNCIÓN HELPER PARA VERIFICAR PERMISOS
async function hasPermissionInComunidad(personaId, comunidadId, action) {
  try {
    const [membership] = await db.query(`
      SELECT rol FROM membresia_comunidad 
      WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
    `, [comunidadId, personaId]);

    if (!membership.length) return false;

    const rol = membership[0].rol;
    const permissions = {
      'read': ['admin', 'administrador', 'tesorero', 'contador', 'comite', 'residente', 'propietario'],
      'create': ['admin', 'administrador', 'tesorero', 'contador'],
      'update': ['admin', 'administrador', 'tesorero', 'contador'],
      'delete': ['admin', 'administrador'],
      'toggle': ['admin', 'administrador', 'tesorero']
    };

    return permissions[action]?.includes(rol) || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

module.exports = router;